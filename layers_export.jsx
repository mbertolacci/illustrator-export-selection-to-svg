/*
 * Layers to SVG - layers_export.jsx
 * @version 0.1
 *
 * @author Anton Ball
 * Exports all layers to SVG Files
 * I didn't want every layer in the SVG file so it first creates a new document
 * and one by one copies each layer to that new document while exporting it out
 * as an SVG.
 *
 * TODO:
 * 1. Although it isn't affecting me at the moment it would be good to center the layer
 *    onto the artboard once it's resized.
 *
 */

// Variables
var docRef = app.activeDocument,
	docPath = docRef.path,
	ignoreHidden = true,
	svgExportOptions = (function(){
		var options = new ExportOptionsSVG();
		options.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;
		options.embedRasterImages = false;
		options.fontType = SVGFontType.OUTLINEFONT;
		return options;
	}()),
	destination, holderDoc;

// Functions
var stepThroughAndExportLayers = function(layers){
	var layer,
		numLayers = layers.length;

	for (var i = 0; i < numLayers; i += 1){
		layer = layers[i];
		if (ignoreHidden && !layer.visible){continue;}
		copyLayerTo(layer, holderDoc);
		// Resize the artboard to the object
		holderDoc.selectObjectsOnActiveArtboard();
		holderDoc.fitArtboardToSelectedArt(0); // Crashes without an index
		exportAsSVG(validateLayerName(layer.name, '-'), holderDoc);
		// Remove everything
		holderDoc.activeLayer.pageItems.removeAll();
	}

	holderDoc.close(SaveOptions.DONOTSAVECHANGES);
},
// Copies the layer to the doc
copyLayerTo = function(layer, doc){
	var pageItem,
		numPageItems = layer.pageItems.length;
	for (var i = 0; i < numPageItems; i++){
		pageItem = layer.pageItems[i];
		pageItem.duplicate(holderDoc.activeLayer, ElementPlacement.PLACEATEND);
	}
},
// Exports the doc to the destination saving it as name
exportAsSVG = function(name, doc){
	var file = new File(destination + '/' + name + '.svg');
	holderDoc.exportFile(file, ExportType.SVG, svgExportOptions);
},
// Makes sure the name is lowercase and no spaces
validateLayerName = function(value, separator){
	separator = separator || '_';
	return value.toLowerCase().replace(/\s/, separator);
};

// Init
(function(){
	destination = Folder.selectDialog('Select folder for SVG files.', docPath);
	if (!destination){return;}
	holderDoc = app.documents.add(DocumentColorSpace.RGB);
	stepThroughAndExportLayers(docRef.layers);
}());