/*
 * Layers to SVG - layers_export.jsx
 * @version 0.1
 * Improved PageItem selection, which fixed centering
 *
 * @author Anton Ball
 * Exports all layers to SVG Files
 * I didn't want every layer in the SVG file so it first creates a new document
 * and one by one copies each layer to that new document while exporting it out
 * as an SVG.
 *
 * TODO:
 * 1. More of an interface wouldn't hurt. Prefix option and progress bar of some description.
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
        selectAll(holderDoc);
        holderDoc.fitArtboardToSelectedArt(0); // Crashes without an index
        exportAsSVG(validateLayerName(layer.name, '-'), holderDoc);
        // Remove everything
        holderDoc.activeLayer.pageItems.removeAll();
    }

    holderDoc.close(SaveOptions.DONOTSAVECHANGES);
};
// Copies the layer to the doc
var copyLayerTo = function(layer, doc){
    var pageItem,
        numPageItems = layer.pageItems.length;
    for (var i = 0; i < numPageItems; i++){
        pageItem = layer.pageItems[i];
        pageItem.duplicate(holderDoc.activeLayer, ElementPlacement.PLACEATEND);
        // pageItem.duplicate(null, ElementPlacement.PLACEATEND);
    }
};
var saveSelection = function(file){
    var objects = app.activeDocument.selection;
    if(objects.length > 0) {
        // Create temporary document and copy all selected objects.
        var doc = app.documents.add(DocumentColorSpace.RGB);
        copyObjectsTo(objects, doc);

        // Resize the artboard to the object
        selectAll(doc);
        doc.fitArtboardToSelectedArt(0); // Crashes without an index

        writeSvgFile(doc, file);

        // Remove everything
        doc.activeLayer.pageItems.removeAll();
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
},
copyObjectsTo = function(objects, destinationDocument){
    for (var i = 0; i < objects.length; i++) {
        objects[i].duplicate(
            destinationDocument.activeLayer,
            ElementPlacement.PLACEATEND);
    }
},
// Selects all PageItems in the doc
selectAll = function(doc){
    var pageItems = doc.pageItems,
        numPageItems = doc.pageItems.length;
    for (var i = 0; i < numPageItems; i += 1){
        pageItems[i].selected = true;
    }
},
writeSvgFile = function(document, file){
    document.exportFile(file, ExportType.SVG, svgExportOptions);
},
// Makes sure the name is lowercase and no spaces
validateLayerName = function(value, separator){
    separator = separator || '_';
    return value.toLowerCase().replace(/\s/, separator);
};

// Init
(function(){
    var file = File.saveDialog('Add SVG file', 'SVG:*.svg');
    if (file) {
        saveSelection(file);
    }
    /*j
    holderDoc = app.documents.add(DocumentColorSpace.RGB);
    stepThroughAndExportLayers(docRef.layers);
    */
}());