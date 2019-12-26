export type product_search_result = {
        count: number;
        hits: Array<object>;
        query: query;
        select: string;
        start: number;
        total: number;
        data?: Array<object>;
        db_start_record_?: number;
        expand?: Array<string>;
        next?: result_page;
        previous?: result_page;
        sorts?: Array<sort>;
}
export type ClassA = {
        property1: string;
        property2?: number;
}
export type customer_product_list_item = {
        id: string;
        priority: number;
        public: boolean;
        purchased_quantity: number;
        quantity: number;
        type: string;
        product?: string;
        product_details_link?: string;
        product_id?: string;
}
export type query = {
}
export type ClassB = {
        property4: number;
        property5: string;
        property3?: ClassA;
}
export type search_request = {
        query: query;
        count?: number;
        db_start_record_?: number;
        expand?: Array<string>;
        select?: string;
        sorts?: Array<sort>;
        start?: number;
}
export type password_change_request = {
        current_password: string;
        password: string;
}
export type sort = {
        field: string;
        sort_order?: string;
}
export type result_page = {
        count: number;
        db_start_record_: number;
        start: number;
}
