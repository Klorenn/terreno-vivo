import json, sys, unicodedata, re, csv
import shapely
from shapely.geometry import shape, Point
from shapely import wkb
import pyarrow.parquet as pq
BASE=sys.argv[1]; OUT=f"{BASE}/salida"; HOY="2026-11-10"
uvidx=[(i, shape(g)) for i,g in json.load(open(f"{OUT}/.uv_index.json"))]
com=shape(json.load(open(f"{OUT}/limite-temuco.geojson"))["features"][0]["geometry"]).buffer(0.002)
def norm(s):
    s=unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]"," ",s).split()
def uv_de(geom):
    hits=[i for i,g in uvidx if g.intersects(geom) and (geom.geom_type=="Point" or g.intersection(geom).area>geom.area*0.02)]
    return hits[0] if len(hits)==1 else None
PREF={"villa","poblacion","pob","comunidad","sector","barrio","condominio","conjunto","camino","reduccion","loteo"}
def alias(nombre):
    t=norm(nombre); a={" ".join(t)}
    if t and t[0] in PREF and len(t)>1: a.add(" ".join(t[1:]))
    return sorted(a)
def tipo_por_nombre(n, defecto):
    t=norm(n)
    if not t: return defecto
    return {"villa":"villa","poblacion":"poblacion","comunidad":"comunidad","reduccion":"comunidad","camino":"camino","ruta":"camino"}.get(t[0], defecto)
entradas=[]; vistos=set()
def agregar(nombre, tipo, geom, origen):
    if not nombre or not com.contains(geom.representative_point()): return
    k=(" ".join(norm(nombre)), tipo)
    if k in vistos or k[0] in ("indeterminada",""): return
    vistos.add(k)
    p=geom.representative_point() if geom.geom_type!="Point" else geom
    entradas.append(({"id":"","nombre_oficial":nombre,"alias":alias(nombre),"tipo":tipo,
        "latitud":round(p.y,5),"longitud":round(p.x,5),"unidad_vecinal":uv_de(geom),
        "fuente":"equipo","fecha_actualizacion":HOY}, origen))
# INE Censo 2024 entidades rurales
t=pq.read_table(f"{BASE}/ine-censo/R09/Cartografia_censo2024_R09_Entidades.parquet",columns=["CUT","ENTIDAD","CATEGORIA","SHAPE"]).to_pylist()
CAT={"Comunidad Indígena":"comunidad","Caserío":"sector","Parcela-Hijuela":"sector","Parcela de Agrado":"sector","Fundo-Estancia-Hacienda":"sector"}
for r in t:
    if r["CUT"]==9101 and r["CATEGORIA"] in CAT:
        nom=re.sub(r"\b(De|Del|La|Las|Los|El|Y)\b", lambda m: m.group(1).lower(), r["ENTIDAD"].title())
        if r["CATEGORIA"]=="Comunidad Indígena" and not nom.lower().startswith("comunidad"): nom="Comunidad "+nom
        agregar(nom, CAT[r["CATEGORIA"]], shapely.make_valid(wkb.loads(r["SHAPE"])), "INE Censo 2024 - Entidades ("+r["CATEGORIA"]+")")
# OSM lugares
for e in json.load(open(f"{BASE}/osm/osm_lugares.json"))["elements"]:
    tg=e.get("tags",{}); n=tg.get("name")
    if tg.get("boundary"): continue
    c=(e["lat"],e["lon"]) if e["type"]=="node" else (e["center"]["lat"],e["center"]["lon"])
    pl=tg.get("place") or "residential"
    defecto="sector" if pl in ("hamlet","locality","isolated_dwelling","village") else "poblacion"
    agregar(n, tipo_por_nombre(n or "", defecto), Point(c[1],c[0]), f"OpenStreetMap {e['type']}/{e['id']} ({pl})")
# OSM caminos (punto central de un tramo; unidad_vecinal null porque cruzan varias UV)
cam={}
for e in json.load(open(f"{BASE}/osm/osm_caminos.json"))["elements"]:
    n=e["tags"]["name"]
    if n.lower().startswith("camino") and n not in ("Camino Vecinal",): cam.setdefault(n,e)
for n,e in cam.items():
    p=Point(e["center"]["lon"],e["center"]["lat"])
    if com.contains(p):
        k=(" ".join(norm(n)),"camino")
        if k in vistos: continue
        vistos.add(k)
        entradas.append(({"id":"","nombre_oficial":n,"alias":alias(n),"tipo":"camino","latitud":round(p.y,5),"longitud":round(p.x,5),
            "unidad_vecinal":None,"fuente":"equipo","fecha_actualizacion":HOY}, f"OpenStreetMap way/{e['id']}"))
for i,(d,_) in enumerate(entradas,1): d["id"]=f"dic-r{i:03d}"
json.dump([d for d,_ in entradas], open(f"{OUT}/diccionario-candidato.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
with open(f"{OUT}/diccionario-candidato-origen.csv","w",newline="",encoding="utf-8") as f:
    w=csv.writer(f); w.writerow(["id","nombre_oficial","tipo","unidad_vecinal","latitud","longitud","origen"])
    for d,o in entradas: w.writerow([d["id"],d["nombre_oficial"],d["tipo"],d["unidad_vecinal"],d["latitud"],d["longitud"],o])
from collections import Counter
print(len(entradas), Counter(d["tipo"] for d,_ in entradas), Counter(o.split(" ")[0] for _,o in entradas), sum(1 for d,_ in entradas if d["unidad_vecinal"] is None))
