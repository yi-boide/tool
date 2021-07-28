/*
 * @Descriptin:
 * @Version: 0.1
 * @Autor: boide gui
 * @Date: 2020-12-22 15:11:31
 * @LastEditors: boide gui
 * @LastEditTime: 2021-06-29 13:44:27
 */
export interface IHttp<T = any> {
    header: any,
    config: any,
    request: any,
    data: {
        code: number,
        msg: string,
        data: T | null
    }
}

export type IHttpResult<T> = Promise<IHttp<T>>

export interface IHttpData<T = any> {
    code: number,
    msg: string,
    data: T
}

export interface ICommonListContainer<T = any> {
    list: T[],
    pageNum: number,
    pageSize: number,
    pages: number,
    total: number,


    /*endRow?: number,
    firstPage?: number,
    hasNextPage?: boolean,
    hasPreviousPage?: boolean,
    isFirstPage?: boolean,
    isLastPage?: boolean,
    lastPage?: number,

    navigateFirstPage?: number,
    navigateLastPage?: number,
    navigatePages?: number,
    navigatepageNums?: any[],
    nextPage?: number,

    prePage?: number,
    size?: number,
    startRow?: number,*/

}


export interface IRulesItem {
    required?: boolean,
    message?: string,
    trigger?: 'change' | 'blur',
    min?: number,
    max?: number,
    type?: 'array' | 'date' | 'string' | 'number',
    validator?: (rule: IRulesItem, value: string | number, cb: (error?: Error) => void) => void
}

export type IRules = { [key: string]: IRulesItem[] }
