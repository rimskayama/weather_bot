export interface Exception {
    response?: {
        data?: {
            message: string;
        };
        status?: number; 
    };

}