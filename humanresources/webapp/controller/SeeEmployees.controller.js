// @ts-nocheck
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel"
    ], 
/**
 * 
 * @param {sap.ui.core.mvc.Controller} Controller 
 * @param {sap.ui.core.UIComponent} UIComponent
 * @param {sap.ui.model.Filter} Filter
 * @param {sap.ui.model.FilterOperator} FilterOperator
 * @param {sap.ui.model.json.JSONModel} JSONModel
 * 
 */
    function (Controller, UIComponent, Filter, FilterOperator, JSONModel) {
        'use strict';
        
        return Controller.extend('rrhh.humanresources.controller.SeeEmployees', {
            onInit: function () {
                this._bus = sap.ui.getCore().getEventBus();
                this._bus.subscribe("flexible", "showEmployee", this.showDetailEmployee, this);
                let modelView = new JSONModel({
                    select: true,
                    details: false
                });
                this.getView().setModel(modelView, 'ModelView');
            },
            
            showDetailEmployee: function(category, eventName, path) {
                var detailsView = this.getView();
                detailsView.bindElement("employeeModel>" + path);
            
                let oContext = detailsView.getBindingContext("employeeModel"),
                    sSapId = oContext.getProperty("SapId"),
                    sEmployeeId = oContext.getProperty("EmployeeId");
                
                let modelView = this.getView().getModel("ModelView");
                
                modelView.setData({
                    select: false,
                    details: true
                })
                modelView.refresh();
                    
                let oUploadSet = this.getView().byId("uploadSet");
                oUploadSet.bindAggregation("items", {
                    path: 'employeeModel>/Attachments',
                    filters: [
                        new Filter({path: "SapId", operator: FilterOperator.EQ, value1: sSapId}),
                        new Filter({path: "EmployeeId", operator: FilterOperator.EQ, value1: sEmployeeId}),
                    ],
                    template: new sap.m.upload.UploadSetItem({
						fileName: "{employeeModel>DocName}",
						mediaType:"{employeeModel>MimeType}",
						visibleEdit: false
					})
                });
                
            },

            onFileBeforeUpload: function (oEvent) {
                
                let oItem = oEvent.getParameter("item"),
                    oModel = this.getView().getModel("employeeModel"),
                    sFileName = oItem.getFileName(),
                    sSecurityToken = oModel.getSecurityToken();

                let path = this.getView().mObjectBindingInfos.employeeModel.path;

                let sSapId = oModel.getProperty(path + "/SapId"),
                    sEmployeeId = oModel.getProperty(path + "/EmployeeId");

                let sSlug = sSapId + ";" + sEmployeeId + ";" + sFileName;

                //add token
                let oCustomerHeaderToken = new sap.ui.core.Item({
                    key: "X-CSRF-Token",
                    text: sSecurityToken
                });

                //add slug
                let oCustomerHeaderSlug = new sap.ui.core.Item({
                    key: "Slug",
                    text: sSlug
                });

                oItem.addHeaderField(oCustomerHeaderToken);
                oItem.addHeaderField(oCustomerHeaderSlug);

            },

            onFileUploadComplete: function (oEvent) {
                let oUploadSet = oEvent.getSource();
                oUploadSet.getBinding("items").refresh();
            },

            onFileDeleted: function (oEvent) {
                let oUploadSet = oEvent.getSource();
                var sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();
    
                this.getView().getModel("employeeModel").remove(sPath, {
                    success: function () {
                        oUploadSet.getBinding("items").refresh();
                    },
                    error: function () {
                    }
                });
            },

            onDeleteEmployee: function (oEvent) {
                sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("sureDelete"),{
                    title : this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
                    onClose : function(oAction){
                            if(oAction === "OK"){
                                this.getView().getModel("employeeModel").remove(this.getView().mObjectBindingInfos.employeeModel.path ,{
                                    success : function(data){
                                        this.getView().getModel("ModelView").setData({
                                            details:false, 
                                            select:true
                                        });
                                        sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("userDeleted"));
                                    }.bind(this),
                                    error : function(e){
                                        sap.base.Log.info(e);
                                    }.bind(this)
                                });
                            }
                    }.bind(this)
                });
            },
	
            onRiseEmployee: function (oEvent){
                if(!this.riseDialog){
                    this.riseDialog = sap.ui.xmlfragment("rrhh/humanresources/fragment/RiseEmployee", this);
                    this.getView().addDependent(this.riseDialog);
                }
                this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}), "newRise");
                this.riseDialog.open();
            },
            
            addRise: function () {
                let newRise = this.riseDialog.getModel("newRise"),
                    employeeModel = this.getView().getModel("employeeModel"),
                    path = this.getView().mObjectBindingInfos.employeeModel.path,
                    sSapId = employeeModel.getProperty(path + '/SapId'),
                    sEmployeeId = employeeModel.getProperty(path + '/EmployeeId'),
                    odata = newRise.getData(),
                    body = {
                        Amount : odata.Amount,
                        CreationDate : odata.CreationDate,
                        Comments : odata.Comments,
                        SapId :sSapId,
                        EmployeeId : sEmployeeId
                    };

                this.getView().setBusy(true);
                employeeModel.create("/Salaries", body, {
                    
                    success : function(){
                        this.getView().setBusy(false);
                        sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("promotedCorrectly"));
                        this.onCloseRiseDialog();
                    }.bind(this),

                    error : function(){
                        this.getView().setBusy(false);
                        sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("promotedUncorrectly"));
                    }.bind(this)
                });
                
            },

            onCloseRiseDialog: function() {
                this.riseDialog.close();
            },

        });

    }
);