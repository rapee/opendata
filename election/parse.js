import '@babel/polyfill';
import _ from 'lodash';
import fs from 'fs';
import csv from 'csv';
import Promise from 'bluebird';

const csvParse = Promise.promisify(csv.parse);
const fpath = './2554_election_area.txt';
const th_path = '../map/th_map.csv';

async function run() {
  const input = fs.readFileSync(fpath, 'utf-8');
  const th = await csvParse(fs.readFileSync(th_path, 'utf-8'), {
    columns: true
  });
  analyze(input, th);
}

function numThai2Arabic(thnum) {
  let n = '';
  for (const t of thnum) {
    n += String.fromCharCode(48 + (t.charCodeAt(0) - 3664));
  }
  return +n;
}

function analyze(str, th) {
  const errors = [];
  const tedsabans = [];
  const data = {};
  let state = 0;
  let province = null;
  const lines = str.split('\n');

  for (const line of lines) {
    // console.log(line);
    if (_.trim(line).length === 0) continue;
    if (line[0] === '-') {
      const name = line.slice(2);
      province = _.find(th, ['name', name]);
      if (!province) {
        errors.push(`Province error: ${name}`);
      } else {
        // console.log(province);
        console.log(`${province.id} ${province.name}`);
        data[province.id] = {
          name: province.name,
          district: {}
        };
      }
      continue;
    }
    // main
    const words = line.split(' ');
    if (words[0] !== 'เขตเลือกตั้งที่') continue;
    const features = words.slice(3);

    const district_id = numThai2Arabic(words[1]);
    const districts = [];
    let current_district = null;

    data[province.id].district[district_id] = districts;
    console.log(`|_ ${province.id}:${district_id} เขต${district_id} ${province.name}`);
    // นอกเขต ในเขต
    // เฉพาะ ยกเว้น
    // เทศบาล เทศบาลตำบล เทศบาลเมือง เทศบาลนคร
    for (let f of features) {
      let is_subdis = false;
      let is_tedsaban = false;
      let only = false;
      let exclude = false;
      let name;
      let dis;
      if (f.slice(0, 3) === 'และ') {
        f = f.slice(3);
      }
      f = _.trim(f, ',)');

      if (f.slice(0, 1) === '(') {
        only = true;
        f = f.slice(1);
      }
      if (f.slice(0, 5) === 'เฉพาะ') {
        only = true;
        f = f.slice(5);
      }
      if (f.slice(0, 5) === 'ในเขต') {
        only = true;
        f = f.slice(5);
      }
      if (f.slice(0, 6) === 'ยกเว้น') {
        only = false;
        exclude = true;
        f = f.slice(6);
      }
      if (f.slice(0, 6) === 'นอกเขต') {
        only = false;
        exclude = true;
        f = f.slice(6);
      }

      if (f.slice(0, 6) === 'เทศบาล') {
        is_tedsaban = true;
        tedsabans.push(`Tedsaban: ${f} / ${province.name}`);
      }
      if (f.slice(0, 3) === 'เขต') {
        name = f.slice(3);
      } else if (f.slice(0, 5) === 'อำเภอ') {
        name = f.slice(5);
      } else if (f.slice(0, 4) === 'แขวง') {
        is_subdis = true;
        name = f.slice(4);
      } else if (f.slice(0, 4) === 'ตำบล') {
        is_subdis = true;
        name = f.slice(4);
      } else {
        name = f;
      }

      dis = _.clone(_.find(th, d => {
        // scope down to same procince
        return is_subdis ? d.id.length === 6 && d.name === name && d.id.slice(0, 4) === current_district.id
          : d.name === name && d.id.slice(0, 2) === province.id;
      }));
      if (!dis) {
        errors.push(`District error: ${f} (${province.name} / ${current_district && current_district.name})`);
        if (!f) errors.push(features);
        if (is_tedsaban) {
          // create fake district
          dis = {
            id: `${province.id}xxxx`,
            parent_id: province.id,
            name,
            name_en: ''
          };
          // if (f.slice(0, 10) === 'เทศบาลตำบล') {
          if (only || exclude) {
            is_subdis = true;
          }
        }
      }
      if (dis) {
        if (is_subdis) {
          if (only) {
            console.log(`      |______ ${dis.id} ${dis.name}`);
          } else if (exclude) {
            console.log(`      |_ excl ${dis.id} ${dis.name}`);
          } else {
            console.log(`              ${dis.id} ${dis.name}`);
          }
        } else {
          if (only) {
            console.log(`    only ${dis.id} ${dis.name}`);
          } else if (exclude) {
            console.log(`    excl ${dis.id} ${dis.name}`);
          } else {
            console.log(`   |_ ${dis.id} ${dis.name}`);
          }
          current_district = dis;
          districts.push(current_district);
        }
      }
    }
  }

  console.log('----------------------------------');
  // console.log(data);
  console.log(`${errors.join('\n')}\n${errors.length} Errors.`);
  console.log(`${tedsabans.join('\n')}\n${tedsabans.length} Tedsaban.`);
  console.log('done.');
}

run();
