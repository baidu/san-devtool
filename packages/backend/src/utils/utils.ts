export function getBridgeMessageNameByHookName(name: string) {
    // store-default-inited -> store:default-inited
    // comp-updated' -> comp:updated
    return name.replace(/^(\w+)-/, '$1:');
}

function toKey(value: any) {
    if (typeof value === 'string') {
        return value;
    }
    let result = value + '';
    return (result === '0' && (1 / value) === -1 / 0) ? '-0' : result;
}

export function getValueByPath(obj: Record<string, any>, path: string[]) {
    if (!Array.isArray(path)) {
        return undefined;
    }

    let index = 0;
    const length = path.length;

    while (obj != null && index < length) {
        obj = obj[toKey(path[index++])];
    }
    return (index && index === length) ? obj : undefined;
}

/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file parse property name
 * @author otakustay
 */

/* eslint-disable max-depth */
const LEFT_SQUARE_BRACKET = '['.charCodeAt(0);

export const parseName = (source: string) => {
    if (Array.isArray(source)) {
        return source;
    }

    // 这个简易的非状态机的实现是有缺陷的
    // 比如 a['dd.cc'].b 这种就有问题了，不过我们不考虑这种场景
    const terms = (source + '').split('.');
    const result = [];

    // eslint-disable-next-line
    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        const propAccessorStart = term.indexOf('[');

        if (propAccessorStart >= 0) {
            if (propAccessorStart > 0) {
                result.push(term.slice(0, propAccessorStart));
                term = term.slice(propAccessorStart);
            }

            while (term.charCodeAt(0) === LEFT_SQUARE_BRACKET) {
                const propAccessorEnd = term.indexOf(']');
                if (propAccessorEnd < 0) {
                    throw new Error('Property path syntax error: ' + source);
                }

                const propAccessorLiteral = term.slice(1, propAccessorEnd);
                if (/^[0-9]+$/.test(propAccessorLiteral)) {
                    // for number
                    result.push(+propAccessorLiteral);
                } else if (/^(['"])([^\1]+)\1$/.test(propAccessorLiteral)) {
                    // for string literal
                    // eslint-disable-next-line no-new-func
                    result.push(new Function('return ' + propAccessorLiteral)());
                } else {
                    throw new Error('Property path syntax error: ' + source);
                }

                term = term.slice(propAccessorEnd + 1);
            }
        } else {
            result.push(term);
        }
    }

    return result;
};
