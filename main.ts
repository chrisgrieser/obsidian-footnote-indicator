import { Plugin, MarkdownView } from "obsidian";

export default class footnoteIndicator extends Plugin {
	footnoteStatusBar: HTMLElement;
	citationStatusBar: HTMLElement;

	async onload() {
		console.log("Footnote & Citation Indicator Plugin loaded.");
		this.footnoteStatusBar = this.addStatusBarItem();
		this.footnoteStatusBar.setText("");
		this.citationStatusBar = this.addStatusBarItem();
		this.citationStatusBar.setText("");

		this.registerEvent(
			this.app.workspace.on("file-open", this.countFootnotes)
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", this.countFootnotes)
		);

		this.registerEvent(
			this.app.workspace.on("file-open", this.countPandocCitations)
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", this.countPandocCitations)
		);
	}

	async onunload() { console.log("Footnote Indicator Plugin unloaded.") }

	countFootnotes = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		let newStatusBarText = "";
		if (mdView && mdView.getViewData()) {
			const content = mdView.getViewData();
			let footnotes = content.match(/\[\^\S+](?!:)/g);
			if (!footnotes) footnotes = [];

			newStatusBarText = footnotes.length.toString() + " fn";
		}
		this.footnoteStatusBar.setText(newStatusBarText);
	};

	countPandocCitations = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		let newStatusBarText = "";
		if (mdView && mdView.getViewData()) {
			const content = mdView.getViewData();

			let pandocCitations = content.match(/@[A-Za-z0-9-]+(?=[,;\] ])/gi);
			if (pandocCitations) pandocCitations = [...new Set(pandocCitations)]; // only unique citations
			else pandocCitations = [];

			newStatusBarText = pandocCitations.length.toString() + " ct";
		}
		this.citationStatusBar.setText(newStatusBarText);
	};

}

