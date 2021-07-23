/**
 * @file
 */
import {builder} from 'san-update';

export const setCount = {
    initData: {
        globalCount: '',
        extraData: 0,
        sonCount: '',
        testObj: {
            a: 1,
            b: {
                c: {
                    count: 0
                }
            }
        }
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        setCount(count, {getState, dispatch}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(dispatch('setCountSon', count + 100));
                }, 2000);
            });
            // return builder()
            //     .set('globalCount', count)
        },
        setCountSon(count) {
            // return new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve(builder().set('sonCount', count));
            //     }, 2000);
            // });
            return builder()
                .set('globalCount', count)
                .set('sonCount', count + 10)
                .set('testObj.b.c', {count: count + 100});
        },
        extraData(count) {
            return builder().set('extraData', count);
        }
    }
};
