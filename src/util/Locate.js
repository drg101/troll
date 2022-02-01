import Fuse from 'fuse.js';
import color_to_name from './ColorToName.js'

let count = 0;

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
            return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
        }

        const all_elements = Array.from(document.getElementsByTagName('*'));
        const elements_text = all_elements.filter(e => {
            return isVisible(e)
        }).map(e => {
            return {
                innerText: e.innerText,
                offset: offset(e),
                width: e.offsetWidth,
                height: e.offsetHeight,
                id: e.id ?? '',
                title: e.title ?? '',
                className: e.className ?? '',
                name: e.name ?? '',
                placeholder: e.placeholder ?? '',
                value: e.value ?? '',
                label: e.label ?? '',
                backgroundColor: window.getComputedStyle(e).backgroundColor ?? ''
            }
        });
        return elements_text
    });

    const elements_bg_color_encoded = elements.map(e => {
        return {
            ...e,
            backgroundColor: e.backgroundColor === '' ? '' : color_to_name(e.backgroundColor).name,
            bgC: e.backgroundColor
        }
    })

    const fuse = new Fuse(elements_bg_color_encoded, {
        includeScore: true,
        keys: ['innerText', 'title', 'id', 'name', 'placeholder', 'value', 'backgroundColor']
    });

    const res = fuse.search(descriptor);
    // console.log(res)
    const element_to_click_on = res[0].item
    element_to_click_on.score = res[0].score
    console.log(element_to_click_on)
    console.log(descriptor)
    await page.screenshot({
        'path': `clicked_on_${count++}.png`, 
        'clip': {
            'x': element_to_click_on.offset.left, 
            'y': element_to_click_on.offset.top, 
            'width': element_to_click_on.width, 
            'height': element_to_click_on.height
        }
    });
    const position_going_to = {
        x: element_to_click_on.offset.left + (element_to_click_on.width * (Math.random() / 2)) + (element_to_click_on.width / 4),
        y: element_to_click_on.offset.top + (element_to_click_on.height * (Math.random() / 2)) + (element_to_click_on.height / 4),
    }
    await cursor.moveTo(position_going_to);
    return position_going_to
}

export default locate;