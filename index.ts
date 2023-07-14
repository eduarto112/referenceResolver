// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>JS Starter</h1>`;

// function refReplacer() {
//   debugger;

//   let m = new Map(),
//     v = new Map(),
//     init = null;

//   // in TypeScript add "this: any" param to avoid compliation errors - as follows
//   //    return function (this: any, field: any, value: any) {
//   return function (field, value) {
//     let p = m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
//     let isComplex = value === Object(value);

//     if (isComplex) m.set(value, p);

//     let pp = v.get(value) || '';
//     let path = p.replace(/undefined\.\.?/, '');
//     let val = pp ? `#REF:${pp[0] == '[' ? '$' : '$.'}${pp}` : value;

//     !init ? (init = value) : val === init ? (val = '#REF:$') : 0;
//     if (!pp && isComplex) v.set(value, path);

//     return val;
//   };
// }
function refReplacer(): (field: any, value: any) => any {
  let catalog = new Map<any, string>(),
    values = new Map<any, string>(),
    init: any = null;

  return function (this: any, field: any, value: any): any {
    let p =
      catalog.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
    let isComplex = value === Object(value);

    if (isComplex) catalog.set(value, p);

    let pp = values.get(value) || '';
    let path = p.replace(/undefined\.\.?/, '');

    let val: any;
    if (pp) {
      val = {};
      let asdf = pp[0] === '[' ? '$' : '$.';
      asdf += pp;

      let obj = [...values.entries()]
        .filter(({ 1: v }) => v === pp)
        .map(([k]) => k);
      val['$ref'] = obj[0]['$id'];
      debugger;
    } else {
      val = value;
    }

    if (!init) {
      init = value;
    } else if (val === init) {
      val = { $ref: '1' };
    }

    if (!pp && isComplex) {
      values.set(value, path);
    }

    return val;
  };
}

export function retrocycle(obj: any): void {
  var catalog: any[] = [];
  catalogObject(obj, catalog);
  resolveReferences(obj, catalog);
}

function catalogObject(obj, catalog: any[]): void {
  // The catalogObject function walks recursively through an object graph
  // looking for $id properties. When it finds an object with that property, then
  // it adds it to the catalog under that key.

  var i: number;
  if (obj && typeof obj === 'object') {
    var id: string = obj.$id;
    if (typeof id === 'string') {
      catalog[id] = obj;
    }

    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      for (i = 0; i < obj.length; i += 1) {
        catalogObject(obj[i], catalog);
      }
    } else {
      for (let name in obj) {
        if (typeof obj[name] === 'object') {
          catalogObject(obj[name], catalog);
        }
      }
    }
  }
}

function resolveReferences(obj: any, catalog: any[], level = 0) {
  // The resolveReferences function walks recursively through the object looking for $ref
  // properties. When it finds one that has a value that is an id, then it
  // replaces the $ref object with a reference to the object that is found in the catalog under
  // that id.
  if (level == 5) {
    return;
  }
  var i: number, item: any, name: string, id: string;

  if (obj && typeof obj === 'object') {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      for (i = 0; i < obj.length; i += 1) {
        item = obj[i];
        if (item && typeof item === 'object') {
          id = item.$ref;
          if (typeof id === 'string') {
            obj[i] = catalog[id];
          } else {
            resolveReferences(item, catalog, level + 1);
          }
        }
      }
    } else {
      for (name in obj) {
        if (typeof obj[name] === 'object') {
          item = obj[name];
          if (item) {
            id = item.$ref;
            if (typeof id === 'string') {
              obj[name] = catalog[id];
            } else {
              resolveReferences(item, catalog, level + 1);
            }
          }
        }
      }
    }
  }
}

let data = {
  $id: '1',
  id: 2,
  code: 'ANAGRAFICHE0002',
  description: 'Laptop-1',
  note: '<p>Laptop hp</p>',
  brandId: 2,
  brand: {
    $id: '2',
    id: 2,
    code: 'LHP01',
    description:"Desc",
    note: '<p>Laptop</p>',
    products: {
      $id: '3',
      $values: [
        {
          $ref: '1',
        },
      ],
    },
    deleted: false,
    createdBy: 'ADMINISTRATOR',
    modifiedBy: null,
    createdDate: '2023-07-13T13:54:10.2199468Z',
    modifiedDate: {
      $ref:'3'
    },
  },
  productAliases: {
    $id: '4',
    $values: [
      {
        $id: '5',
        id: 17,
        alias: 'AL',
        productId: 2,
        ordinalNumber: 2,
        measureUnit: '2',
        product: {
          $ref: '1',
        },
        deleted: false,
        createdBy: 'ADMINISTRATOR',
        modifiedBy: 'ADMINISTRATOR',
        createdDate: '2023-07-13T13:54:10.2199473Z',
        modifiedDate: '2023-07-13T13:57:22.2454415Z',
      },
    ],
  },
  deleted: false,
  createdBy: 'ADMINISTRATOR',
  modifiedBy: 'ADMINISTRATOR',
  createdDate: '2023-07-13T13:54:10.2198999Z',
  modifiedDate: '2023-07-13T14:57:12.1110368Z',
};

retrocycle(data);


console.log(data);

let s = JSON.stringify(data, refReplacer());

// let asdf=JSON.parse(s)

// console.log(asdf);
console.log(s);
