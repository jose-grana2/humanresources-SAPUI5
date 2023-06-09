sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"rrhh/humanresources/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("rrhh.humanresources.Component", {

		metadata: {
			manifest: "json"
		},
		
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			   //create the views based on the url/hash
			   this.getRouter().initialize();

		},
		SapId: "jose.gran.rod@gmail.com"
	});
});
