/*
 *  MIPS-Simulator : store.js [Stores content into file]
 *  Copyright (C)  2017  Progyan Bhattacharya, Bytes Club
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const fs = require("fs");

/** class: Store
 * @desc Store Parse Trre Object into File Passed as Parameter
 * @param {string}      file       - Destination File Path
 * @param {Object}      flag       - Configuration Object
 * @prop  {boolean}     isSilent   - Omit Error Message to Standard Error
 * @prop  {boolean}     showWarn   - Display Warning instead of Error/Log
 * @prop  {boolean}     showDetail - Display Details of The Error Message
 * @prop  {FileStream}  store      - FileStream Module of Node.JS for File IO
 * @prop  {string}      target     - Path to Destination File
 * @prop  {boolean}     hasError   - True iff Any Error has Occured
 * @prop  {string}      errorText  - The Error Message
 * @prop  {string}      error      - Details of The Error
 * @prop  {string}      content    - Parse Tree Object
 */
class Store extends Object {
    constructor({ file, flag }) {
        super();

        // House-keeping
        if (typeof file === "undefined" || file === null) {
            const err = "No file parameter passed. Expected one!";
            throw err;
        }

        // Member variables
        const flagDefined = typeof flag !== "undefined";
        this.isSilent     = flagDefined && typeof flag.silent === "boolean" ?
                            flag.silent :
                            false;
        this.showWarn     = flagDefined && typeof flag.warning === "boolean" ?
                            flag.warning :
                            true;
        this.showDetail   = flagDefined && typeof flag.details === "boolean" ?
                            flag.details :
                            false;
        this.store        = fs;
        this.target       = file;
        this.hasError     = false;
        this.errorText    = null;
        this.error        = null;
        this.content      = null;
        this.save         = this.save.bind(this);
        this.getError     = this.getError.bind(this);
    }

    /** method: save
     * @desc Save Contents into Output File Specified
     * @prop {FileStream} store  - File Loader for IO
     * @prop {string}     file   - Target File Path
    */
    save(content) {
        const { store, target: file } = this;

        // Check if file exist on path
        if (store.existsSync(file)) {
            console.log(`${file} already exists, trying to overwrite the` +
                " content.");
            store.truncateSync(file);

            // Check write permission on the file
            try {
                store.accessSync(file, store.constants.W_OK);
            } catch (e) {
                this.hasError = true;
                this.errorText = `Fatal Error: Cannot write to file ${file}.` +
                    " Make sure you have WRITE permission on it.";
                this.error = e.toString();
                return this.getError();
            }
        }

        // Read file content
        try {
            const data = JSON.stringify(content);
            store.writeFileSync(file, data, "utf8");
        } catch (e) {
            this.hasError = true;
            this.errorText = `Fatal Error: Failed to store into ${file}.` +
                " Make sure the file is not corrupted.";
            this.error = e.toString();
            return this.getError();
        }
    }

    /** method: getError
     * @desc Display Error Information if any
     * @prop {boolean} hasError   - True iff Any Error has Occured
     * @prop {boolean} isSilent   - Omit Error Message to Standard Error
     * @prop {boolean} showWarn   - Display Warning instead of Error/Log
     * @prop {boolean} showDetail - Display Details of The Error Message
     * @prop {string}  errorText  - The Error Message
     * @prop {string}  error      - Details of The Error
     */
    getError() {
        const
        { hasError, isSilent, showWarn, showDetail, error, errorText } = this;

        // If error occured
        if (hasError) {
            let errorMsg = errorText;
            if (showDetail && error) {
                errorMsg = `${errorMsg}\n${error}`;
            }
            if (isSilent) {
                if (showWarn) {
                    console.warn(errorMsg);
                } else {
                    console.log(errorMsg);
                }
            } else {
                console.error(errorMsg);
            }
        }
    }
}

module.exports = Store;
