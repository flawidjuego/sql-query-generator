import DataTypes from "./DataTypes.js"

export default class CreateTable {
    constructor(tableName) {
        this.tableName = tableName
        this.columns = []
        this.primaryKey = null
    }

    addPrimaryColumn(columnName) {
        this.columns.push({
            name: columnName,
            type: DataTypes.BIGINT_UNSIGNED
        })

        this.primaryKey = columnName

        return this
    }

    addColumn(columnName, columnType, defaultValue, nullable=false) {
        this.columns.push({
            name: columnName,
            type: columnType,
            defaultValue: defaultValue,
            nullable: nullable
        })

        return this
    }

    addColumns(columns) {
        Object.keys(columns).forEach(column => {
            if('type' in columns[column] === false) {
                throw new Error(`Column 'type' missing for ${column}. Column 'type' is mandatory when defining a column with 'addColumns'`)
            }
            this.columns.push(
                Object.assign({
                    name: column,
                }, columns[column])
            );
        })

        return this
    }

    addTimestamps() {
        this.columns.push({
            name: 'created_at',
            type: DataTypes.DATETIME,
            defaultValue: 'CURRENT_TIMESTAMP'
        })

        this.columns.push({
            name: 'updated_at',
            type: DataTypes.DATETIME,
            defaultValue: 'CURRENT_TIMESTAMP'
        })

        return this
    }

    addPrimaryKey(columName) {
        this.primaryKey = columName

        return this
    }

    handleDefaultValue(defaultValue) {
        if(defaultValue === 'CURRENT_TIMESTAMP') {
            return defaultValue
        }

        return JSON.stringify(defaultValue).replace(/"/g, '\'')
    }

    generate() {
        let sql = `CREATE TABLE \`${this.tableName}\` (\n`

        this.columns.forEach(column => {
            const defaultSQLString = column.defaultValue !== undefined && column.defaultValue !== null ? ` DEFAULT ${this.handleDefaultValue(column.defaultValue)}` : ''
            const notNullSQLString = !column.nullable ? ' NOT NULL' : ''
            const autoIncrement = column.name === this.primaryKey ? ' AUTO_INCREMENT' : ''
            sql += `  ${column.name} ${column.type}${notNullSQLString}${defaultSQLString}${autoIncrement},\n`
        })

        if(this.primaryKey) {
            sql += `  PRIMARY KEY (${this.primaryKey})`
        }

        sql += `\n)`

        return sql
    }

    generateAlter() {
        let sql = `ALTER TABLE ${this.tableName}\n`;

        this.columns.forEach((column, index) => {
            const defaultSQLString = column.defaultValue !== undefined && column.defaultValue !== null ? ` DEFAULT ${this.handleDefaultValue(column.defaultValue)}` : '';
            const notNullSQLString = !column.nullable ? ' NOT NULL' : '';
            const autoIncrement = column.name === this.primaryKey ? ' AUTO_INCREMENT' : '';
            const afterColumn = 'after' in column && column.after ? ` AFTER ${column.after}` : ''
            sql += `ADD COLUMN ${column.name} ${column.type}${notNullSQLString}${defaultSQLString}${autoIncrement}${afterColumn}`;
            if(this.columns.length - 1 !== index) {
                sql += ',\n'
            }
        });

        return sql
    }
}
