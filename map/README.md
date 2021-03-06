# Map of Thailand

TopoJSON files here are prepared from Shapefile ([found here](https://csuwan.weebly.com/download.html)). TopoJSON is suitable to use on the web and better than GeoJSON (smaller file, topology-preserved.)

# Data Preparations

## Tools

- [GDAL](http://www.gdal.org) (convert Shapefile)
- [mapshaper](https://github.com/mbloch/mapshaper) (simply shapes)


## Steps to reproduce

```bash
# 1. Convert from Shapefile to GeoJSON
ogr2ogr -f GeoJSON -t_srs crs:84 out.geojson in.shp

# 2. (Optional) Simplify using the default algorithm, retaining 10% of removable vertices.
mapshaper out.geojson -simplify 5% -o out-5.geojson

# 3. Simplify and export to TopoJSON
mapshaper out.geojson -simplify 5% -n -o out-5.topojson format=topojson
```

```bash
# Separated layers
mapshaper -i th_amphoe.geojson -simplify dp 10% keep-shapes -o th_amphoe-10.topojson format=topojson

# Combine all layers into single file
mapshaper -i th_province.geojson th_amphoe.geojson th_tambon.geojson combine-files snap -simplify dp 10% keep-shapes -o th_map.topojson format=topojson
```

# Prepare CSV

```bash
mapshaper th_province.geojson -o th_province.csv format=csv
```

