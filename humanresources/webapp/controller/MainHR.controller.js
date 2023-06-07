//@ts-nocheck
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/UIComponent",
		"sap/m/library"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.UIComponent} UIComponent
	 * @param {typeof sap.m.library} sapMLib
     */
	function (Controller, UIComponent, sapMLib) {
		"use strict";

		return Controller.extend("rrhh.humanresources.controller.MainHR", {
			
			onInit: function () {
				
			},

			navigateToCreateEmployee: function (oEvent) {
				const oRouter = new UIComponent.getRouterFor(this);
				oRouter.navTo("CreateEmployee");
			},

			navigateToSeeEmployee: function (oEvent) {
				const oRouter = new UIComponent.getRouterFor(this);
				oRouter.navTo("SeeEmployees");
			},

			navigateToSignOrders: function () {
					const url = "https://b1cb4fa7trial-dev-employees-deploy-approuter.cfapps.us10-001.hana.ondemand.com";
					const { URLHelper } = sapMLib;
					URLHelper.redirect(url);
			}
			
		});
	});
