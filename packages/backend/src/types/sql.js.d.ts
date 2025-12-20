declare module 'sql.js' {
    interface SqlJsStatic {
        Database: typeof Database;
    }

    interface Database {
        run(sql: string, params?: any[]): void;
        exec(sql: string, params?: any[]): QueryExecResult[];
        export(): Uint8Array;
        close(): void;
        getRowsModified(): number;
    }

    interface QueryExecResult {
        columns: string[];
        values: any[][];
    }

    function initSqlJs(config?: any): Promise<SqlJsStatic>;

    export default initSqlJs;
    export { Database, SqlJsStatic, QueryExecResult };
}
