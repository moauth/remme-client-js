"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonObject = /** @class */ (function () {
    function JsonObject() {
    }
    JsonObject.fromJson = function (jsonString) {
        var jsonObject = JSON.parse(jsonString);
        var object = new this();
        for (var prop in jsonObject) {
            if (!jsonObject.hasOwnProperty(prop)) {
                continue;
            }
            object[prop] = jsonObject[prop];
        }
        return object;
    };
    return JsonObject;
}());
exports.JsonObject = JsonObject;
// class User {
//     private vame: string;
//     public getVame() {
//         return this.vame;
//     }
// }
//
// const json = {
//     vame: null,
// };
//
// const user = (<any>Object).assign(new User(), json) as User;
//
// console.log(user);
//# sourceMappingURL=index.js.map