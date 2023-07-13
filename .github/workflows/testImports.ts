import { readdirSync } from "fs"

function getDirectories(source: string) {
    return readdirSync(source, { withFileTypes: true })
        .map(dirent => dirent.name)
}

const emission_keys = getDirectories(`./protocols`)
Promise.all(emission_keys.map(k=>import(`../../protocols/${k}`)))