export default async function loadJSON(url: string) {
    return fetch(url)
        .then(resp => resp.text())
        .then(text => {
            return text;
        })
        .then(text => JSON.parse(text))
}
