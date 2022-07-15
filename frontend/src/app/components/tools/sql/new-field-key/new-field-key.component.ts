
/*
 * Magic Cloud, copyright Aista, Ltd. See the attached LICENSE file for details.
 */

// Angular and system imports.
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Model for creating a new field or key in the specified table.
 */
export class NewFieldKeyModel {
  databaseType: string;
  connectionString: string;
  table: string;
  database: any;
  type: string;
  name: string;
  field: string;
  datatype: any;
  foreignTable: string;
  foreignField: string;
  fkName: string;
  size: number;
  defaultValue: string;
  acceptNull: boolean;
}

/**
 * Component allowing user to create a new field or foreign key.
 */
@Component({
  selector: 'app-new-field-key',
  templateUrl: './new-field-key.component.html',
  styleUrls: ['./new-field-key.component.scss']
})
export class NewFieldKeyComponent {

  // Datatypes specific for MySQL.
  private mySqlDataTypes = [
    {name: 'char', size: {min: 0, max: 255, defaultSize: 20}, defaultValue: 'string'},
    {name: 'varchar', size: {min: 0, max: 16383, defaultSize: 100}, defaultValue: 'string'},
    {name: 'binary', size: {min: 0, max: 255, defaultSize: 100}, defaultValue: false},
    {name: 'varbinary', size: {min: 0, max: 16383, defaultSize: 5000}, defaultValue: false},
    {name: 'tinyblob', defaultValue: false},
    {name: 'tinytext', defaultValue: 'string'},
    {name: 'text', size: {min: 0, max: 65535, defaultSize: 65535}, defaultValue: 'string'},
    {name: 'blob', size: {min: 0, max: 65535, defaultSize: 65535}, defaultValue: false},
    {name: 'mediumtext', defaultValue: 'string'},
    {name: 'mediumblob', defaultValue: false},
    {name: 'longtext', defaultValue: 'string'},
    {name: 'longblob', defaultValue: false},
    {name: 'bit', size: {min: 1, max: 64, defaultSize: 1}, defaultValue: 'bool'},
    {name: 'tinyint', size: {min: 0, max: 255, defaultSize: 1}, defaultValue: 'int'},
    {name: 'bool', defaultValue: 'bool'},
    {name: 'boolean', defaultValue: 'bool'},
    {name: 'smallint', size: {min: 0, max: 65535, defaultSize: 10}, defaultValue: 'int'},
    {name: 'mediumint', size: {min: 0, max: 255, defaultSize: 10}, defaultValue: 'int'},
    {name: 'int', size: {min: 0, max: 255, defaultSize: 10}, defaultValue: 'int'},
    {name: 'integer', size: {min: 0, max: 255, defaultSize: 10}, defaultValue: 'int'},
    {name: 'bigint', size: {min: 0, max: 255, defaultSize: 10}, defaultValue: 'int'},
    {name: 'double', size: {min: 0, max: 65535, defaultSize: 10}, defaultValue: 'decimal'},
    {name: 'decimal', size: {min: 0, max: 65, defaultSize: 10}, defaultValue: 'decimal'},
    {name: 'dec', size: {min: 0, max: 65, defaultSize: 10}, defaultValue: 'decimal'},
    {name: 'date', defaultValue: 'date'},
    {name: 'datetime', defaultValue: 'date'},
    {name: 'timestamp', defaultValue: 'date'},
    {name: 'time', defaultValue: 'int'},
    {name: 'year', defaultValue: 'int'},
  ];

  // Datatypes specific for SQLite.
  private sqlIteDataTypes = [
    {name: 'integer', defaultValue: 'int'},
    {name: 'real', defaultValue: 'decimal'},
    {name: 'text', defaultValue: 'string'},
    {name: 'blob', defaultValue: false},
    {name: 'nvarchar', size: {min: 0, max: 65535, defaultSize: 65535}, defaultValue: false},
    {name: 'varchar', size: {min: 0, max: 65535, defaultSize: 65535}, defaultValue: 'string'},
  ];
  private pgsqlDataTypes = [
    {name: 'Numeric', defaultValue: 'Numeric'},
    {name: 'text', defaultValue: 'string'},
    {name: 'blob', defaultValue: false},
    {name: 'nvarchar', size: {min: 0, max: 65535}, defaultValue: false},
    {name: 'varchar', size: {min: 0, max: 65535}, defaultValue: 'string'},
  ];
  private mssqlDataTypes = [
    {name: 'integer', defaultValue: 'integer'},
    {name: 'text', defaultValue: 'string'},
    {name: 'blob', defaultValue: false},
    {name: 'nvarchar', size: {min: 0, max: 65535}, defaultValue: false},
    {name: 'varchar', size: {min: 0, max: 65535}, defaultValue: 'string'},
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: NewFieldKeyModel) { }

  /**
   * Returns all fields in table to caller.
   */
  getFields() {
    return this.data.database.tables.filter(x => x.name === this.data.table)[0].columns;
  }

  /**
   * Returns the supported datatypes for the specified database type to caller.
   */
  getDataTypes() {
    switch (this.data.databaseType) {

      case 'mysql':
        return this.mySqlDataTypes;

      case 'sqlite':
        return this.sqlIteDataTypes;

      case 'pgsql':
        return this.pgsqlDataTypes;
      case 'mssql':
        return this.mssqlDataTypes;
      }
  }

  /**
   * Returns all tables in database to caller.
   */
  getTables() {
    return this.data.database.tables.map((x: any) => x.name);
  }

  /**
   * Returns all fields in specified table to caller.
   */
  getForeignField(table: string) {
    return this.data.database.tables.filter((x: any) => x.name == table)[0].columns.map((x: any) => x.name);
  }

  /**
   * Returns true if input is valid.
   */
  verifyInput() {
    switch (this.data.type) {

      case 'field':
        return this.data.name && this.data.datatype && (!this.data.datatype.size || this.data.size);

      case 'key':
        return this.data.field && this.data.foreignTable && this.data.foreignField;
    }
  }

  /**
   * Invoked when datatype changes.
   */
  datatypeChanged() {
    if (this.data.datatype.defaultValue === 'date') {

      switch (this.data.databaseType) {

        case 'mysql':
        case 'sqlite':
          this.data.defaultValue = 'current_timestamp';
          break;
      }

    } else if (this.data.datatype.defaultValue === 'int') {

      switch (this.data.databaseType) {

        case 'mysql':
        case 'sqlite':
          this.data.defaultValue = 'auto_increment';
          break;
      }

    } else {
      this.data.size = this.data.datatype.size?.defaultSize;
      delete this.data.defaultValue;
    }
  }
}
