import Fuse from 'fuse.js';

const locate = async (descriptor, page, cursor) => {
    // const aHandle = await page.evaluateHandle('document'); // Handle for the 'document'
    const elements = await page.evaluate(async () => {
        const offset = (el) => {
            const rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop + el.offsetHeight / 2, left: rect.left + scrollLeft + el.offsetWidth / 2 }
        }

        const all_elements = Array.from(document.getElementsByTagName('*'));
        const elements_text = all_elements.map(e => {
            return {
                innerText: e.innerText,
                offset: offset(e),
                id: e.id ?? '',
                title: e.title ?? '',
                className: e.className ?? '',
                name: e.name ?? ''
            }
        });
        return elements_text
    })
    const fuse = new Fuse(elements, {
        includeScore: true,
        keys: ['innerText', 'title', 'id', 'name']
    });

    const res = fuse.search(descriptor);
    const element_to_click_on = res[0].item
    element_to_click_on.score = res[0].score
    console.log(element_to_click_on)
    await cursor.moveTo({
        x: element_to_click_on.offset.left,
        y: element_to_click_on.offset.top
    });
}

export default locate;