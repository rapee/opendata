# Election District

This script parse election district from text to structured data. Each election district composed from tambons and tedsabans, or, if all tambons are included, the whole amphoe. It takes into account the inclusion and exclusion of tambons in amphoe. District ID mapping depends on district name defined in `th_map.csv`.

Note that mapping is not complete because one of these reasons:

- เทศบาล (Tedsaban) data is missing.
- District names are not consistent.
- District names are not up-to-date.

## Run

Install node dependencies

```bash
npm i
```

To parse election district, run

```bash
npm start
```

## Reference

- [กกต.แบ่งเขตเลือกตั้ง ส.ส.ครบ 77 จังหวัด 375 เขต แล้ว!!. Manager Online](https://mgronline.com/politics/detail/9540000049741)
