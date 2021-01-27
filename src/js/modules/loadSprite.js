export default function(url, data) {
  let ajax = new XMLHttpRequest()
  ajax.open("GET", url, true)
  ajax.send()
  ajax.onload = function(e) {
    let elem = document.createElement("div")
    elem.innerHTML = ajax.responseText

    elem.style.display = "none"

    data.class ? elem.classList.add(data.class) : elem.classList.add("sprite")
    data.fill === true ? false : elem.querySelectorAll("[fill]").forEach((index) => {
      index.removeAttribute("fill")
    })

    return document.body.insertBefore(elem, document.body.childNodes[0])
  }

  return console.error(url)
}