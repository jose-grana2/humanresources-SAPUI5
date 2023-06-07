sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/UIComponent",
],
/**
 * 
 * @param {sap.ui.core.mvc.Controller} Controller 
 * @param {sap.ui.model.Filter} Filter
 * @param {sap.ui.model.FilterOperator} FilterOperator
 * @param {sap.ui.core.UIComponent} UIComponent
 * 
 */
function(Controller, Filter, FilterOperator, UIComponent) {
    'use strict';

    return Controller.extend('rrhh.humanresources.controller.ListEmployees', {
        
        onInit: function () {
            this._bus = sap.ui.getCore().getEventBus();
            
        },
       
        onPressBack: function () {
            let oRouter = new UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMainHR");
        },

        showEmployee: function(oEvent) {
            let path = oEvent.getParameter("listItem").getBindingContext("employeeModel").getPath();
            this._bus.publish("flexible", "showEmployee", path);
        },

        onSearchEmployee: function () {

            var oEmployeeList = this.getView().byId("listEmployee");
            var sSearchValue = this.getView().byId("seacherEmployee").getValue();

            let oFilter = new Filter({
                filters: [
                    new Filter("FirstName", FilterOperator.Contains, sSearchValue),
                    new Filter("LastName", FilterOperator.Contains, sSearchValue),
                ],
                and: false
            });

            oEmployeeList.getBinding("items").filter([oFilter]);
        },
        

    });



});
