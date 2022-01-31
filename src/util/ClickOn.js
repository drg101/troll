import locate from "./Locate.js"

const click_on = async (descriptor, page, cursor) => {
    await locate(descriptor, page, cursor);
    cursor.click()
}

export default click_on;