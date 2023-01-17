import * as fs from 'fs';
import jp from 'jsonpath';
import { xml2js } from 'xml-js';
import parseSvgPath = require('parse-svg-path');

const curvePrecision = 1 / 10;

// Origin: https://stackoverflow.com/a/5624139
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

function svgPathToLines(d): [number,number][] {
  const output   = [];
  const commands = parseSvgPath(d);
  let   cursor   = [0,0];
  for(const command of commands) {
    switch(command[0]) {
      case 'm':
      case 'l':
        command[1] += cursor[0];
        command[2] += cursor[1];
        // Intentional fall-through
      case 'M':
      case 'L':
        cursor[0] = command[1];
        cursor[1] = command[2];
        output.push([...cursor]);
        break;
      case 'h':
        command[1] += cursor[0];
        // Intentional fall-through
      case 'H':
        cursor[0] = command[1];
        output.push([...cursor]);
        break;
      case 'v':
        command[1] += cursor[1];
        // Intentional fall-through
      case 'V':
        cursor[1] = command[1];
        output.push([...cursor]);
        break;
      case 'c':
        command[1] += cursor[0];
        command[2] += cursor[1];
        command[3] += cursor[0];
        command[4] += cursor[1];
        command[5] += cursor[0];
        command[6] += cursor[1];
        // Intentional fall-through
      case 'C':
        let ax = cursor[0];
        let ay = cursor[1];
        let bx = command[1];
        let by = command[2];
        let cx = command[3];
        let cy = command[4];
        let dx = command[5];
        let dy = command[6];
        for(let d=curvePrecision; d < 1; d += 0.1) {
          let di = 1 - d;
          let ex = (ax*d) + (bx*di); // e = a..b
          let ey = (ay*d) + (by*di);
          let fx = (bx*d) + (cx*di); // f = b..c
          let fy = (by*d) + (cy*di);
          let gx = (cx*d) + (dx*di); // g = c..d
          let gy = (cy*d) + (dy*di);
          let hx = (ex*d) + (fx*di); // h = e..f
          let hy = (ey*d) + (fy*di);
          let ix = (fx*d) + (gx*di); // i = f..g
          let iy = (fy*d) + (gy*di);
          let jx = (hx*d) + (ix*di); // j = h..i
          let jy = (hy*d) + (iy*di);
          output.push([ jx, jy ]);
        }
        cursor[0] = command[5];
        cursor[1] = command[6];
        output.push([...cursor]);
        break;
      case 'z':
      case 'Z':
        // Close path, which is default behavior
        break;
      default:
        throw new Error(`Unsupported command: ${command[0]}`);
    }
  }
  return output;
}

export function loadSvg(filename: string): any[] {
  const output = []; // List of ENTITIES

  const data = xml2js(fs.readFileSync(filename, 'utf-8'), {
    attributeNameFn : name => name.toLowerCase(),
    elementNameFn   : name => name.toLowerCase(),
  });

  // Fetch the root svg element, mainly for it's attributes
  const svgQuery     = '$.elements[?(@.name=="svg")]';
  const [svgElement] = jp.query(data, svgQuery);
  if (!svgElement) return [];

  // Fetch entities from svg element
  const entityQuery = '$..elements[?(@.name=="g")]';
  const entities    = jp.query(svgElement, entityQuery);

  // Iterate over shapes within those entities
  for(const entity of entities) {
    const outputEntity = [hexToRgb(entity.attributes.fill || '#000')];
    for(const el of entity.elements) {
      const path = [];
      switch(el.name) {
        case 'path':
          path.push(...svgPathToLines(el.attributes.d));
          outputEntity.push(path);
          break;
        case 'g':
          // Intentionally unsupported
          break;
        default:
          throw new Error(`Unsupported element in <g>: <${el.name}>`);
      }
    }
    if (outputEntity.length > 1) {
      output.push(outputEntity);
    }
  }

  // Find viewbox, use paths instead of svg.attributes.viewbox
  let minx =  Infinity;
  let maxx = -Infinity;
  let miny =  Infinity;
  let maxy = -Infinity;
  for(const entity of output) {
    for(let i=1; i < entity.length; i++) {
      for(const point of entity[i]) {
        if (point[0] < minx) minx = point[0];
        if (point[0] > maxx) maxx = point[0];
        if (point[1] < miny) miny = point[1];
        if (point[1] > maxy) maxy = point[1];
      }
    }
  }

  // Scale image to -1..1 across it's largest axis
  const midx  = (maxx + minx) / 2;
  const midy  = (maxy + miny) / 2;
  const scale = Math.min(
    2 / (maxx - minx),
    2 / (maxy - miny),
  );
  for(const entity of output) {
    for(let i=1; i < entity.length; i++) {
      for(const point of entity[i]) {
        point[0] = (point[0] - midx) * scale;
        point[1] = (point[1] - midy) * scale;
      }
    }
  }

  return output;
}
