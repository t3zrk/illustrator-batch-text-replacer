//@target illustrator

/*
 * Illustrator Batch Text Replacer
 * Version: 2.0.0
 * Repository: https://github.com/t3zrk/illustrator-batch-text-replacer
 *
 * Batch find-and-replace utility for Adobe Illustrator.
 * Works on selected text frames and text frames nested inside selected groups.
 */

(function IllustratorBatchTextReplacer() {
    var APP_NAME = "Illustrator Batch Text Replacer";
    var VERSION = "2.0.0";
    var DEFAULT_ROWS = 5;
    var MAX_ROWS = 12;

    if (!app.documents.length) {
        alert(APP_NAME + "\n\nOpen an Illustrator document before running the script.");
        return;
    }

    var documentRef = app.activeDocument;
    var selectionRef = documentRef.selection;

    if (!selectionRef || !selectionRef.length) {
        alert(APP_NAME + "\n\nSelect one or more text frames or groups containing text.");
        return;
    }

    app.preferences.setBooleanPreference("ShowExternalJSXWarning", false);

    var directFrames = collectTextFrames(selectionRef, false);
    var allFrames = collectTextFrames(selectionRef, true);

    if (!allFrames.length) {
        alert(APP_NAME + "\n\nNo text frames were found in the current selection.");
        return;
    }

    var dialog = new Window("dialog", APP_NAME + "  v" + VERSION);
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    var intro = dialog.add("group");
    intro.orientation = "column";
    intro.alignChildren = ["left", "top"];
    intro.add("statictext", undefined, "Replace multiple words or phrases across selected Illustrator text frames.");
    var selectionLabel = intro.add("statictext", undefined, selectionSummary(directFrames.length, allFrames.length));

    var replacementsPanel = dialog.add("panel", undefined, "Replacement pairs");
    replacementsPanel.orientation = "column";
    replacementsPanel.alignChildren = ["fill", "top"];
    replacementsPanel.margins = [12, 18, 12, 12];
    replacementsPanel.spacing = 6;

    var header = replacementsPanel.add("group");
    header.orientation = "row";
    var findHeader = header.add("statictext", undefined, "Find");
    findHeader.characters = 24;
    var replaceHeader = header.add("statictext", undefined, "Replace with");
    replaceHeader.characters = 24;

    var rowsGroup = replacementsPanel.add("group");
    rowsGroup.orientation = "column";
    rowsGroup.alignChildren = ["fill", "top"];
    rowsGroup.spacing = 5;

    var rows = [];
    for (var initialIndex = 0; initialIndex < DEFAULT_ROWS; initialIndex++) {
        addReplacementRow();
    }

    var rowControls = replacementsPanel.add("group");
    rowControls.orientation = "row";
    var addRowButton = rowControls.add("button", undefined, "+ Add pair");
    var removeRowButton = rowControls.add("button", undefined, "- Remove last");
    var clearButton = rowControls.add("button", undefined, "Clear");

    var optionsPanel = dialog.add("panel", undefined, "Options");
    optionsPanel.orientation = "column";
    optionsPanel.alignChildren = ["left", "top"];
    optionsPanel.margins = [12, 18, 12, 12];

    var caseInsensitiveBox = optionsPanel.add("checkbox", undefined, "Case-insensitive matching");
    caseInsensitiveBox.value = false;

    var wholeWordsBox = optionsPanel.add("checkbox", undefined, "Match whole words / phrase boundaries");
    wholeWordsBox.value = true;

    var includeGroupsBox = optionsPanel.add("checkbox", undefined, "Include text frames inside selected groups");
    includeGroupsBox.value = true;
    includeGroupsBox.enabled = allFrames.length !== directFrames.length;

    var statusPanel = dialog.add("panel", undefined, "Status");
    statusPanel.orientation = "column";
    statusPanel.alignChildren = ["left", "top"];
    statusPanel.margins = [12, 18, 12, 12];
    var statusText = statusPanel.add("statictext", undefined, "Enter at least one replacement pair, then preview or replace.");
    statusText.characters = 66;

    var buttons = dialog.add("group");
    buttons.alignment = "right";
    var previewButton = buttons.add("button", undefined, "Preview");
    buttons.add("button", undefined, "Cancel", { name: "cancel" });
    var replaceButton = buttons.add("button", undefined, "Replace All", { name: "ok" });

    addRowButton.onClick = function () {
        if (rows.length >= MAX_ROWS) {
            alert("You can use up to " + MAX_ROWS + " replacement pairs at a time.");
            return;
        }
        addReplacementRow();
        refreshLayout();
        rows[rows.length - 1].find.active = true;
    };

    removeRowButton.onClick = function () {
        if (rows.length <= 1) {
            rows[0].find.text = "";
            rows[0].replace.text = "";
            statusText.text = "At least one row is kept available.";
            return;
        }
        var last = rows.pop();
        rowsGroup.remove(last.group);
        refreshLayout();
    };

    clearButton.onClick = function () {
        for (var i = 0; i < rows.length; i++) {
            rows[i].find.text = "";
            rows[i].replace.text = "";
        }
        statusText.text = "Replacement pairs cleared.";
        rows[0].find.active = true;
    };

    includeGroupsBox.onClick = function () {
        selectionLabel.text = selectionSummary(directFrames.length, includeGroupsBox.value ? allFrames.length : directFrames.length);
    };

    previewButton.onClick = function () {
        var state = buildState();
        if (!state) {
            return;
        }

        var preview = calculateChanges(state.frames, state.pairs, state.options);
        if (!preview.occurrences) {
            statusText.text = "Preview: no matching text found in " + state.frames.length + " frame(s).";
            return;
        }

        statusText.text = "Preview: " + preview.occurrences + " replacement(s) across " + preview.changedFrames + " of " + state.frames.length + " frame(s).";
    };

    replaceButton.onClick = function () {
        var state = buildState();
        if (!state) {
            return;
        }

        var preview = calculateChanges(state.frames, state.pairs, state.options);
        if (!preview.occurrences) {
            alert(APP_NAME + "\n\nNo matching text was found. No changes were made.");
            return;
        }

        var confirmation = confirm(
            APP_NAME + "\n\n" +
            "Ready to make " + preview.occurrences + " replacement(s) across " + preview.changedFrames + " text frame(s).\n\n" +
            "Continue?"
        );

        if (!confirmation) {
            return;
        }

        var result = applyChanges(state.frames, state.pairs, state.options);
        app.redraw();
        dialog.close();

        alert(
            APP_NAME + "\n\n" +
            "Completed " + result.occurrences + " replacement(s) across " + result.changedFrames + " text frame(s)."
        );
    };

    dialog.onShow = function () {
        rows[0].find.active = true;
    };

    dialog.center();
    dialog.show();

    function addReplacementRow() {
        var row = rowsGroup.add("group");
        row.orientation = "row";
        row.alignChildren = ["left", "center"];

        var findInput = row.add("edittext", undefined, "");
        findInput.characters = 24;

        var replaceInput = row.add("edittext", undefined, "");
        replaceInput.characters = 24;

        rows.push({
            group: row,
            find: findInput,
            replace: replaceInput
        });
    }

    function refreshLayout() {
        dialog.layout.layout(true);
        dialog.layout.resize();
    }

    function buildState() {
        var frames = includeGroupsBox.value ? allFrames : directFrames;
        if (!frames.length) {
            alert("No eligible text frames are selected for the current options.");
            return null;
        }

        var pairs = [];
        var seen = {};

        for (var i = 0; i < rows.length; i++) {
            var findValue = rows[i].find.text;
            var replaceValue = rows[i].replace.text;

            if (!hasVisibleCharacters(findValue)) {
                continue;
            }

            if (findValue === replaceValue) {
                continue;
            }

            var duplicateKey = caseInsensitiveBox.value ? findValue.toLowerCase() : findValue;
            if (seen[duplicateKey]) {
                alert("Duplicate find value: \"" + findValue + "\". Remove the duplicate before continuing.");
                rows[i].find.active = true;
                return null;
            }

            seen[duplicateKey] = true;
            pairs.push({ find: findValue, replace: replaceValue });
        }

        if (!pairs.length) {
            alert("Enter at least one valid Find value. A replacement can be blank if you want to delete matching text.");
            rows[0].find.active = true;
            return null;
        }

        return {
            frames: frames,
            pairs: pairs,
            options: {
                caseInsensitive: caseInsensitiveBox.value,
                wholeWords: wholeWordsBox.value
            }
        };
    }

    function calculateChanges(frames, pairs, options) {
        var changedFrames = 0;
        var occurrences = 0;

        for (var i = 0; i < frames.length; i++) {
            var original = safeContents(frames[i]);
            var transformed = transformText(original, pairs, options);

            if (transformed.text !== original) {
                changedFrames++;
                occurrences += transformed.occurrences;
            }
        }

        return {
            changedFrames: changedFrames,
            occurrences: occurrences
        };
    }

    function applyChanges(frames, pairs, options) {
        var changedFrames = 0;
        var occurrences = 0;

        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            var original = safeContents(frame);
            var transformed = transformText(original, pairs, options);

            if (transformed.text !== original) {
                frame.textRange.contents = transformed.text;
                changedFrames++;
                occurrences += transformed.occurrences;
            }
        }

        return {
            changedFrames: changedFrames,
            occurrences: occurrences
        };
    }

    function transformText(text, pairs, options) {
        var output = text;
        var totalOccurrences = 0;

        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var expression = createExpression(pair.find, options);
            var replacement = pair.replace;
            var pairCount = 0;

            output = output.replace(expression, function () {
                pairCount++;
                return replacement;
            });

            totalOccurrences += pairCount;
        }

        return {
            text: output,
            occurrences: totalOccurrences
        };
    }

    function createExpression(findValue, options) {
        var pattern = escapeRegExp(findValue);

        if (options.wholeWords) {
            if (/^[A-Za-z0-9_]/.test(findValue)) {
                pattern = "\\b" + pattern;
            }
            if (/[A-Za-z0-9_]$/.test(findValue)) {
                pattern = pattern + "\\b";
            }
        }

        return new RegExp(pattern, options.caseInsensitive ? "gi" : "g");
    }

    function collectTextFrames(items, includeGroups) {
        var frames = [];
        var seen = [];

        for (var i = 0; i < items.length; i++) {
            collectFromItem(items[i], includeGroups, frames, seen);
        }

        return frames;
    }

    function collectFromItem(item, includeGroups, frames, seen) {
        if (!item) {
            return;
        }

        try {
            if (item.typename === "TextFrame") {
                if (!containsReference(seen, item)) {
                    seen.push(item);
                    frames.push(item);
                }
                return;
            }

            if (includeGroups && item.typename === "GroupItem") {
                for (var i = 0; i < item.pageItems.length; i++) {
                    collectFromItem(item.pageItems[i], true, frames, seen);
                }
            }
        } catch (error) {
            // Ignore inaccessible page items and continue processing the selection.
        }
    }

    function containsReference(items, candidate) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === candidate) {
                return true;
            }
        }
        return false;
    }

    function safeContents(frame) {
        try {
            return frame.textRange.contents;
        } catch (error) {
            return "";
        }
    }

    function selectionSummary(directCount, activeCount) {
        if (allFrames.length === directFrames.length) {
            return activeCount + " selected text frame(s) detected.";
        }
        return directCount + " direct text frame(s); " + allFrames.length + " including text inside selected groups.";
    }

    function hasVisibleCharacters(value) {
        return value && value.replace(/^\s+|\s+$/g, "").length > 0;
    }

    function escapeRegExp(value) {
        return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
})();
