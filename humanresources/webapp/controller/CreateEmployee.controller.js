// @ts-nocheck
// @ts-ignore
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/upload/UploadSetItem",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/type/Date"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.ui.model.Filter} Filter
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator,
 * @param {typeof sap.m.upload.UploadSetItem} UploadSetItem
 * @param {typeof sap.ui.core.format.DateFormat} DateFormat
 * @param {typeof sap.ui.model.type.Date} Date
 * 
 */
function (Controller, JSONModel, Filter, FilterOperator, UploadSetItem, DateFormat, Date) {
    'use strict';
   
    return Controller.extend("rrhh.humanresources.controller.CreateEmployee", {
		
        onInit: function() {
            this._bus = sap.ui.getCore().getEventBus();
            this._wizard = this.byId("wizardEmployee");
            this._modelEmployee  = new JSONModel({});
            this.getView().setModel(this._modelEmployee, 'EmployeeModel');
            //reset the posibles steps created previously
            var oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
           
            // scroll to top
            this._wizard.goToStep(oFirstStep);
            
            // invalidate first step
            oFirstStep.setValidated(false);
        },


        onTypeEmployee: function (oEvent) {
            var typeButtonPressed = oEvent.getSource();
            var vTypeEmployee = typeButtonPressed.data("TypeEmployee");
            var oView = this.getView();
    
            switch (vTypeEmployee) {
                case "0":
                    this._modelEmployee.setData({
                        TypeEmployee: vTypeEmployee,
                        SalaryDefault: 24000,
                        SalaryMin: 12000,
                        SalaryMax: 80000
                    });
                    break;
                case "1":
                    this._modelEmployee.setData({
                        TypeEmployee: vTypeEmployee,
                        SalaryDefault: 400,
                        SalaryMin: 100,
                        SalaryMax: 2000
                    });
                    break;
                case "2":
                    this._modelEmployee.setData({
                        TypeEmployee: vTypeEmployee,
                        SalaryDefault: 70000,
                        SalaryMin: 50000,
                        SalaryMax: 200000
                    });
                    break;
                default:
                    break;
    
            }
            
            //First Step
            var typeEmployeeStep = oView.byId("TypeEmployeeStep").getId();
            //Second Step
            var dataEmployeeStep = oView.byId("EmployeeData").getId();
    
            // check the current step and we do according the value
            if (this._wizard.getCurrentStep() === typeEmployeeStep) {
                this._wizard.nextStep();
            } else {
                this._wizard.goToStep(dataEmployeeStep);
            }
            this._wizard.validateStep(this.getView().byId("TypeEmployeeStep"));
        },

        onValidatorDNI: function (oEvent) {
            var oView = this.getView();
            var typeEmployee = this._modelEmployee;
            var oDataTypeEmployee = typeEmployee.getData();

            
            //validate if the de employee isn't 1 (self-employed)
            if (oEvent.getSource().getValue() !== '1' ) {
                var dni = oEvent.getParameter("value"), 
                    number, 
                    letter,
                    letterList,
                    regularExp = /^\d{8}[a-zA-Z]$/;
                
                if (regularExp.test(dni) === true) {
                    //Number
                    number = dni.substr(0, dni.length - 1);
                    //Letter
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    
                    if (letter !== letter.toUpperCase()) {
                        oDataTypeEmployee.DniStatus = "Error";
                    } else {
                        oDataTypeEmployee.DniStatus = "None";
                        oDataTypeEmployee.Dni = dni
                        this.onValidateDataEmployee();
                    }
                } else {
                    //Error 
                    oDataTypeEmployee.DniStatus = "Error";
                }
                typeEmployee.refresh();
            }
        },

        onValidateDataEmployee: function (oEvent, callback) {
            var oData = this._modelEmployee.getData();
            var oView = this.getView();
            var isValid = true;

            // check Name 
            if (!oView.byId("nameEmployee").getValue()) {
                oData.FirstNameState = "Error";
                isValid = false;
            } else {
                oData.FirstNameState = "None";
                // oData.FirstName = oView.byId("nameEmployee").getValue();
            }

            // check LastName 
            if (!oView.byId("surnameEmployee").getValue()) {
                oData.LastNameState = "Error";
                isValid = false;
            } else {
                oData.LastNameState = "None";
                // oData.LastName = oView.byId("surnameEmployee").getValue();
            }

            // check Date 
            if (!oView.byId("dateJoining").getValue()) {
                oData.DateState = "Error";
                isValid = false;
            } else {
                if (!this.isValidDate(oView.byId("dateJoining").getValue())) {
                    oData.DateState = "Error";
                    isValid = false;
                } else {    
                    oData.DateState = "None";
                    // oData.CreationDate = oView.byId("dateJoining").getValue()
                }
            }

            //check CIF and DNI depend of type employee
            if (oData.TypeEmployee !== '1') {
                // check DNI
              if (!oView.byId("DNIEmployee").getValue()) {
                  oData.DniStatus = "Error";
                  isValid = false;
              } else {
                  oData.DniStatus = "None";
                //   oData.Dni = oView.byId("DNIEmployee").getValue();
              }
            } else {
                //check CIF
                if(!oView.byId("CIFEmployee").getValue()) {
                    oData.CifStatus = "Error";
                    isValid = false;
                } else {
                    oData.CifStatus = "None";
                    // oData.Dni = oView.byId("CIFEmployee").getValue()
                }
            }

            oData.Salary = oView.byId("Salary").getValue();

            this._modelEmployee.refresh();

            if (isValid) {
                this._wizard.validateStep(this.byId("EmployeeData"));
            } else {
                this._wizard.invalidateStep(this.byId("EmployeeData"));
            }
        },

        
        onFileBeforeUpload: function (oEvent) {
           
            let oItem = oEvent.getParameter("item"),
                oModel = this.getView().getModel("employeeModel"),
                sFileName = oItem.getFileName(),
                sSecurityToken = oModel.getSecurityToken();
            
            let sSlug = sFileName;

            //adding token 
            let oCustomerHeaderToken = new sap.ui.core.Item({
                key:'X-CSRF-TOKEN',
                text: sSecurityToken
            });
            
            // adding Slug
            let oCustomerHeaderSlug = new sap.ui.core.Item({
                key:'Slug',
                text: sSlug
            });

            oItem.addHeaderField(oCustomerHeaderSlug);
            oItem.addHeaderField(oCustomerHeaderToken);

        },

        editStep: function (step){
            let wizardNavContainer = this.byId("wizardNavContainer");
            //Se añade un función al evento afterNavigate, ya que se necesita 
            //que la función se ejecute una vez ya se haya navegado a la vista principal
            let fnAfterNavigate = function () {
                    this._wizard.goToStep(this.byId(step));
                    //Se quita la función para que no vuelva a ejecutar al volver a nevagar
                    wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);
    
            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        },

        editFirstStep: function () {
            this.editStep.bind(this)("TypeEmployeeStep");
        },
        editSecondStep: function() {
            this.editStep.bind(this)("EmployeeData");
        },
        editThirdStep: function() {
            this.editStep.bind(this)("additionalInformation");
        },

        onCompleteWizard: function (oEvent) {
            let wizardNavContainer = this.byId("wizardNavContainer");
            wizardNavContainer.to(this.byId("ReviewPage"));
        },

        onSaveEmployee: function (){
            let body = {},
                oEmployeesModel = this._modelEmployee.getData();
            
            body.Type = oEmployeesModel.TypeEmployee;
            body.FirstName = oEmployeesModel.FirstName;
            body.LastName = oEmployeesModel.LastName;
            body.Dni = oEmployeesModel.Dni;
            body.CreationDate = oEmployeesModel.CreationDate;
            body.Comments = oEmployeesModel.Comments;
            body.SapId = this.getOwnerComponent().SapId;
            body.UserToSalary = [{
                Amount : parseFloat(oEmployeesModel.Salary).toString(),
                Comments : oEmployeesModel.Comments,
                Waers : "EUR"
            }];

            this.getView().setBusy(true);
            this.getView().getModel("employeeModel").create("/Users",body,{
                success : function(data){
                    this.getView().setBusy(false);
                    this.newUser = data.EmployeeId;
                    this.amount = data.Amount;
                    this.waers = data.Waers;
                    this.date = data.CreationDate;
                    this.sapId = data.SapId;
                    this.comments = data.Comments;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("newEmployee") + ": " + this.newUser,{
                        onClose : function(){
                            var wizardNavContainer = this.byId("wizardNavContainer");
                            wizardNavContainer.back();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("MainHR",{},true);
                        }.bind(this)
                    });
                    this.onSaveSalary(this.newUser, this.sapId, this.amount, this.date, this.waers, this.comments);
                    this.onStartUpload();
                }.bind(this),
                error : function(e){
                    this.getView().setBusy(false);
                }.bind(this)
            });
        },

        //

        onStartUpload: function () {
            let oUploadSet = this.getView().byId("uploadSetAttachments");
            oUploadSet.getItems().forEach(function (oItem){
                oUploadSet.uploadItem(oItem);
            });
        },

        onSaveSalary: function(employeeId, sapId, amount, date, waers, comments) {
            let employeeModel = this.getView().getModel("employeeModel");
            
            let body = {
                SapId : sapId,
                EmployeeId : employeeId,
                CreationDate : date,
                Amount : amount,
                Waers : waers,
                Comments : comments,
            }
            
            employeeModel.create("/Salaries", body, {
                success : function(){
                    this.getView().setBusy(false);
                }.bind(this),
                error : function(e){
                    this.getView().setBusy(false);
                }.bind(this)
            });
          
        },
        
        //TOOLS
        isValidDate: function (dateString) {
            const pattern = /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/\d{2}$/;
            if (!pattern.test(dateString)) {
              return false;
            }
            return true;
        },

    });
});