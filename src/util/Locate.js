import Fuse from 'fuse.js';


const locate = async (descriptor, page, cursor) => {

    // const aHandle = await page.evaluateHandle('document'); // Handle for the 'document'
    const elements = await page.evaluate(async () => {
        function isVisible(elem) {
            if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
            const style = getComputedStyle(elem);
            if (style.display === 'none') return false;
            if (style.visibility !== 'visible') return false;
            if (style.opacity < 0.1) return false;
            if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
                elem.getBoundingClientRect().width === 0) {
                return false;
            }
            let elemCenter;
            console.log({ elem })
            try {
                elemCenter = {
                    x: elem.getBoundingClientRect().left + (elem.offsetWidth ?? elem.getBBox().width) / 2,
                    y: elem.getBoundingClientRect().top + (elem.offsetHeight ?? elem.getBBox().height) / 2
                };
            }
            catch {
                return false;
            }
            if (elemCenter.x < 0) return false;
            if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
            if (elemCenter.y < 0) return false;
            if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
            console.log({ x: elemCenter.x, y: elemCenter.y })
            let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
            do {
                if (!pointContainer) break;
                if (pointContainer === elem) return true;
            } while (pointContainer = pointContainer?.parentNode);
            return false;
        }

        const offset = (el) => {
            const rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop + el.offsetHeight / 2, left: rect.left + scrollLeft + el.offsetWidth / 2 }
        }

        const all_elements = Array.from(document.getElementsByTagName('*'));
        const elements_text = all_elements.filter(e => {
            return isVisible(e)
        }).map(e => {
            return {
                innerText: e.innerText,
                offset: offset(e),
                id: e.id ?? '',
                title: e.title ?? '',
                className: e.className ?? '',
                name: e.name ?? '',
                placeholder: e.placeholder ?? '',
                value: e.value ?? ''
            }
        });
        return elements_text
    })
    const fuse = new Fuse(elements, {
        includeScore: true,
        keys: ['innerText', 'title', 'id', 'name', 'placeholder', 'value']
    });

    const res = fuse.search(descriptor);
    const element_to_click_on = res[0].item
    element_to_click_on.score = res[0].score
    console.log(element_to_click_on)
    console.log(descriptor)
    await cursor.moveTo({
        x: element_to_click_on.offset.left,
        y: element_to_click_on.offset.top
    });
}

export default locate;