import Fuse from 'fuse.js';
import { createCursor } from 'ghost-cursor';

const locate = async (descriptor, page) => {
    // const aHandle = await page.evaluateHandle('document'); // Handle for the 'document'
    const cursor = createCursor(page)
    const elements = await page.evaluate(async () => {
        const offset = (el) => {
            const rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
        }

        const all_elements = Array.from(document.getElementsByTagName('*'));
        const elements_text = all_elements.map(e => {
            return {
                innerText: e.innerText,
                offset: offset(e),
                id: e.id,
                title: e.title,
                className: e.className
            }
        });
        return elements_text
    })
    const fuse = new Fuse(elements, {
        includeScore: true,
        keys: ['innerText']
    });

    const res = fuse.search(descriptor);
    const element_to_click_on = res[0].item
    console.log(element_to_click_on)
    cursor.moveTo({
        x: element_to_click_on.offset.left,
        y: element_to_click_on.offset.top
    });
    cursor.click()
}

export default locate;