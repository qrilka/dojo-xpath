dojo.provide("xpath.Repeat");

dojo.require("dijit._WidgetBase");
dojo.require("dojo.regexp");
dojo.require("dojo.parser");
xpath.Repeat = undefined;
dojo.addOnLoad(function() {
xpath.Repeat =  dojo.declare("xpath.Repeat", [dijit._WidgetBase], {
		// stopParser: [private] Boolean
		//		Flag to parser to not try and parse widgets declared inside the container.
        stopParser: true,

		// templateString: [private] String
		//		The template or content for this container. It is usually obtained from the
		//		body of the container and may be modified or repeated over a collection/array.
		//		In this simple implementation, attach points, attach events and WAI
		//		attributes are not supported in the template.
		templateString : "",

        startup: function(){
            var binding = dojo.getObject(this.doc);
		    console.log(this.xpath, binding);
            if (binding) {
                binding.watch("xml", dojo.hitch(this, function(_data, _old, newValue){
                    this._buildContent(newValue);
                }))
                this._buildContent(binding.xml);
            }
		    this.inherited(arguments);
	    },

		// summary:
		//		Override and save template from body.
		postscript: function(params, srcNodeRef){
			this.srcNodeRef = dojo.byId(srcNodeRef);
			if (this.srcNodeRef) {
				if(this.templateString == ""){ // only overwrite templateString if it has not been set
					this.templateString = this.srcNodeRef.innerHTML;
				}
				this.srcNodeRef.innerHTML = "";
			}
			this.inherited(arguments);
		},

        _xpathRepl: function (tmpl, node) {
            return tmpl.replace(new RegExp("\\$spath{(.*?)}","g"),
				function(match, key, format){
                    return document.evaluate(key, node, null, XPathResult.STRING_TYPE, null).stringValue;
				});
        },
        
        _buildContent: function(xml) {
            var it = document.evaluate(this.xpath, xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            var insert = "";
            var node = null;
            while (node = it.iterateNext()) {
                insert += this._xpathRepl(this.templateString, node);
            }

			var repeatNode = this.srcNodeRef || this.domNode;
			repeatNode.innerHTML = insert;

			// srcNodeRef is used in _createBody, so in the programmatic create case where repeatNode was set  
			// from this.domNode we need to set srcNodeRef from repeatNode
			this.srcNodeRef = repeatNode;

			this._containedWidgets = dojo.parser.parse(this.srcNodeRef,{
				template: true,
				inherited: {dir: this.dir, lang: this.lang},
				propsThis: this,
				scope: "dojo"
			});
        }
    });
});