import json, sys, os, unicodedata
import shapefile, shapely
from shapely.geometry import shape, mapping, Point
from shapely import wkb
import pyarrow.parquet as pq

BASE = sys.argv[1]
UVSHP = f"{BASE}/bidat-uv-2026/unidades_vecinales_junio2026/unidades_vecinales_junio2026_v1.shp"
CENSO = f"{BASE}/ine-censo/R09/Cartografia_censo2024_R09_"
OUT = f"{BASE}/salida"
TOL = float(os.environ.get("TOL", "0.00008"))  # ~8 m

# Tabla 1 PLADECO Temuco 2020-2024 (Decreto Alcaldicio 2001 del 27-06-2018)
PLADECO = {
 1:("Prieto Sur","Centro"),2:("Caupolicán","Centro"),3:("Estación","Centro"),
 4:("5 Sur","Amanecer"),5:("Amanecer","Amanecer"),6:("Aquelarre","Amanecer"),7:("Borde Río","Amanecer"),
 8:("Recabarren","Amanecer"),9:("Industrial","Amanecer"),
 10:("Alemania","Poniente"),11:("Estadio","Poniente"),12:("Las Encinas","Poniente"),
 13:("Museo Ferroviario","Pueblo Nuevo"),14:("Nahuelbuta","Pueblo Nuevo"),15:("Acceso Norte","Pueblo Nuevo"),
 16:("San Antonio","Costanera del Cautín"),17:("Valparaíso","Costanera del Cautín"),18:("Los Ríos","Costanera del Cautín"),19:("Costanera","Costanera del Cautín"),
 20:("Cerro Mariposas","Pedro de Valdivia"),21:("Villa Alegre","Pedro de Valdivia"),22:("Javiera Carrera Oriente","Pedro de Valdivia"),
 23:("Javiera Carrera Poniente","Pedro de Valdivia"),24:("Raluncoyán","Pedro de Valdivia"),25:("Coihueco","Pedro de Valdivia"),
 26:("Creadores","El Carmen"),27:("Botrolhue","Botrolhue"),
 28:("Alto del Bosque","Labranza"),29:("Labranza Alto","Labranza"),30:("Labranza Uno Norte","Labranza"),31:("Sector Ribereño","Labranza"),
 32:("Ñielol","Ñielol"),33:("Tromén Mollulco","Rural"),34:("Boyeco","Rural"),35:("La Serena","Rural"),36:("Monte Verde","Rural"),
}
def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode().lower()
    return "-".join(s.replace("/"," ").split())

r = shapefile.Reader(UVSHP, encoding="utf-8")
uvs, descartadas = [], []
for sr in r.iterShapeRecords():
    d = sr.record.as_dict()
    if d["t_com"] != "09101": continue
    g = shapely.make_valid(shape(sr.shape.__geo_interface__))
    if d["uv_carto"].strip().isdigit():
        n = int(d["uv_carto"]); uvs.append((n, d, g))
    else:
        descartadas.append((d, g))
uvs.sort(key=lambda x: x[0])
assert [u[0] for u in uvs] == list(range(1,37)), [u[0] for u in uvs]

# Población Censo 2024: manzanas (urbanas + aldeas) + entidades rurales, asignadas por punto representativo
def capa(nombre, cols):
    t = pq.read_table(CENSO + nombre + ".parquet", columns=cols + ["SHAPE"])
    for row in t.to_pylist():
        if row["CUT"] == 9101:
            yield row, wkb.loads(row["SHAPE"])
pts = []
for row, g in capa("Manzanas", ["CUT","n_per"]): pts.append((g.representative_point(), row["n_per"] or 0))
ent_rows = list(capa("Entidades", ["CUT","n_per","ENTIDAD","CATEGORIA","AREA_C"]))
for row, g in ent_rows: pts.append((g.representative_point(), row["n_per"] or 0))
total_censo = sum(p for _, p in pts)
geoms = [g for _,_,g in uvs]
tree = shapely.STRtree(geoms)
pob = [0.0]*36; sin_uv = 0.0
for p, n in pts:
    idx = [i for i in tree.query(p) if geoms[i].covers(p)]
    if idx: pob[idx[0]] += n
    else: sin_uv += n

# Simplificación preservando bordes compartidos
simpl = shapely.coverage_simplify(shapely.GeometryCollection(geoms).geoms if False else geoms, TOL) if hasattr(shapely,"coverage_simplify") else [g.simplify(TOL, preserve_topology=True) for g in geoms]
def redondear(geom):
    return shapely.set_precision(geom, 0.00001)
feats = []
for (n, d, g), gs in zip(uvs, simpl):
    nombre, macro = PLADECO[n]
    gs = shapely.make_valid(redondear(gs))
    if gs.geom_type == "GeometryCollection":
        gs = shapely.union_all([x for x in gs.geoms if x.geom_type in ("Polygon","MultiPolygon")])
    feats.append({"type":"Feature","properties":{
        "id": f"uv-{n:02d}", "nombre": f"UV {n} {nombre}", "macrosector": f"Macrosector {macro}",
        "poblacion": int(round(pob[n-1]))},
        "geometry": mapping(gs)})
def dump(obj, path):
    with open(path,"w",encoding="utf-8") as f: json.dump(obj, f, ensure_ascii=False, separators=(",",":"))
dump({"type":"FeatureCollection","features":feats}, f"{OUT}/uv-real.geojson")

# Versión de referencia sin simplificar + atributos fuente
full = [{"type":"Feature","properties":{"id":f"uv-{n:02d}","uv_carto":d["uv_carto"],"t_uv_nom":d["t_uv_nom"],"t_id_uv_ca":d["t_id_uv_ca"]},"geometry":mapping(g)} for n,d,g in uvs]
full += [{"type":"Feature","properties":{"id":None,"uv_carto":d["uv_carto"],"t_uv_nom":d["t_uv_nom"],"t_id_uv_ca":d["t_id_uv_ca"]},"geometry":mapping(g)} for d,g in descartadas]
dump({"type":"FeatureCollection","features":full}, f"{OUT}/uv-temuco-original-midesof-2026.geojson")

# Macrosectores por disolución
macros = {}
for f, g in zip(feats, simpl):
    macros.setdefault(f["properties"]["macrosector"], []).append(shape(f["geometry"]))
mfeats = []
for nom, gs in macros.items():
    u = shapely.make_valid(redondear(shapely.union_all(gs)))
    mfeats.append({"type":"Feature","properties":{"id":"ms-"+slug(nom.replace("Macrosector ","")),"nombre":nom},"geometry":mapping(u)})
dump({"type":"FeatureCollection","features":mfeats}, f"{OUT}/macrosectores-real.geojson")

# Límites comunales INE 2024
t = pq.read_table(CENSO+"Comunal.parquet", columns=["CUT","COMUNA","SHAPE"]).to_pylist()
lim = {}
for row in t:
    if row["CUT"] in (9101, 9112):
        g = shapely.make_valid(wkb.loads(row["SHAPE"]))
        lim[row["CUT"]] = g
        gs = redondear(g.simplify(TOL, preserve_topology=True))
        dump({"type":"FeatureCollection","features":[{"type":"Feature","properties":{"cut":str(row["CUT"]).zfill(5),"nombre":row["COMUNA"].title()},"geometry":mapping(gs)}]},
             f"{OUT}/limite-{slug(row['COMUNA'])}.geojson")

uvu = shapely.union_all(geoms)
com = lim[9101]
# área en grados^2 -> proporción
print(json.dumps({
  "uv_features": len(feats), "descartadas": [(d["uv_carto"], round(g.area/com.area*100,3)) for d,g in descartadas],
  "tipos_geom": sorted({f["geometry"]["type"] for f in feats}),
  "cobertura_uv_sobre_comuna_pct": round(uvu.intersection(com).area/com.area*100,2),
  "uv_fuera_de_comuna_pct": round(uvu.difference(com).area/uvu.area*100,3),
  "uv_que_tocan_padre_las_casas_pct": round(uvu.intersection(lim[9112]).area/uvu.area*100,3),
  "bbox_comuna": [round(x,4) for x in com.bounds],
  "poblacion_total_censo_2024": total_censo, "poblacion_asignada": sum(pob), "poblacion_sin_uv": sin_uv,
  "poblacion_por_uv": {f["properties"]["id"]: f["properties"]["poblacion"] for f in feats},
  "macrosectores": {m["properties"]["id"]: (m["geometry"]["type"]) for m in mfeats},
  "bytes_uv": os.path.getsize(f"{OUT}/uv-real.geojson"), "bytes_macro": os.path.getsize(f"{OUT}/macrosectores-real.geojson"),
  "bytes_full": os.path.getsize(f"{OUT}/uv-temuco-original-midesof-2026.geojson"),
  "vertices_uv": sum(len(shapely.get_coordinates(shape(f["geometry"]))) for f in feats),
}, ensure_ascii=False, indent=1))

# Guarda geometrías UV para el diccionario
with open(f"{OUT}/.uv_index.json","w") as f: json.dump([(f2["properties"]["id"], mapping(g)) for f2,g in zip(feats,geoms)], f)
