//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);

(function batchReplaceMultipleFrames() {
  // 1) Ensure at least one document & selection
  if (!app.documents.length) {
    alert("Please open a document first.");
    return;
  }
  var sel = app.activeDocument.selection;
  if (!sel.length) {
    alert("Please select one or more Text Frames.");
    return;
  }

  // 2) Build the dialog
  var dlg = new Window("dialog", "Batch Replace (Multi‑Frame)");
  dlg.orientation = "column";
  dlg.alignChildren = ["fill","top"];
  dlg.spacing = 8;
  dlg.margins = 12;

  // Header labels
  var header = dlg.add("group");
  header.add("statictext", undefined, "Word").characters = 20;
  header.add("statictext", undefined, "Replace With").characters = 20;

  // Panel for fixed rows
  var NUM_ROWS = 5;              // adjust number of rows as needed
  var panel = dlg.add("panel");
  panel.orientation = "column";
  panel.alignChildren = ["fill","top"];
  panel.margins = [8,20,8,8];
  panel.spacing = 5;
  panel.preferredSize.height = 200; 

  var inputs = [];
  for (var i = 0; i < NUM_ROWS; i++) {
    var row = panel.add("group");
    row.orientation = "row";
    var from = row.add("edittext", undefined, "");
    from.characters = 20;
    var to = row.add("edittext", undefined, "");
    to.characters = 20;
    inputs.push({ from: from, to: to });
  }

  // Case‑insensitive checkbox
  var caseGroup = dlg.add("group");
  var caseBox = caseGroup.add("checkbox", undefined, "Case‑insensitive");
  caseBox.value = false;

  // Bottom buttons
  var btns = dlg.add("group");
  btns.alignment = "center";
  btns.add("button", undefined, "Cancel", { name: "cancel" });
  var ok = btns.add("button", undefined, "Replace All", { name: "ok" });

  ok.onClick = function() {
    var flags = caseBox.value ? "gi" : "g";
    var replacedCount = 0;

    // Loop through each selected item
    for (var s = 0; s < sel.length; s++) {
      var item = sel[s];
      if (item.typename !== "TextFrame") continue;

      var original = item.textRange.contents;
      var updated  = original;

      // Apply each replacement pair
      for (var j = 0; j < inputs.length; j++) {
        var a = inputs[j].from.text;
        var b = inputs[j].to.text;
        if (!a) continue;

        var re = new RegExp("\\b" + escapeRegExp(a) + "\\b", flags);
        updated = updated.replace(re, b);
      }

      if (updated !== original) {
        item.textRange.contents = updated;
        replacedCount++;
      }
    }

    dlg.close();
    alert("Replaced text in " + replacedCount + " frame" + (replacedCount === 1 ? "" : "s") + ".");
  };

  dlg.center();
  dlg.show();

  // Utility: escape special regex chars
  function escapeRegExp(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
})();
