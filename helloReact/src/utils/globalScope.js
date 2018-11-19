import store from 'storejs'

window.bjfn || (window.bjfn = {})
let { bjfn } = window

export function getGlobalData (key) {
  return bjfn[key]
}

export function setGlobalData (data) {
  bjfn = Object.assign(bjfn, data)
}


export function getLocalData (key) {
  let data = store(key);
  try{
    data = JSON.parse(data);
  } catch(e) {
  }
  return data;
}

export function setLocalData (key, value) {
  localStorage.setItem(key, value ? JSON.stringify(value): null)
}

