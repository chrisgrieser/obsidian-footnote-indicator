import { Plugin, MarkdownView, debounce } from "obsidian";

export default class footnoteIndicator extends Plugin {
	footnoteStatusBar: HTMLElement;
	citationStatusBar: HTMLElement;

	async onload() {
		const countDelay = 1000;

		console.log("Footnote & Citation Indicator Plugin loaded.");
		this.footnoteStatusBar = this.addStatusBarItem();
		this.footnoteStatusBar.setText("");
		this.citationStatusBar = this.addStatusBarItem();
		this.citationStatusBar.setText("");

		this.registerEvent(
			this.app.workspace.on("file-open", this.countFootnotes)
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", debounce(this.countFootnotes, countDelay, true))
		);

		this.registerEvent(
			this.app.workspace.on("file-open", this.countPandocCitations)
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", debounce(this.countPandocCitations, countDelay, true))
		);
	}

	async onunload() { console.log("Footnote Indicator Plugin unloaded.") }

	countFootnotes = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		let newStatusBarText = "";
		if (mdView !== null && mdView.getViewData()) {
			const content = mdView.getViewData();
			const regularFn = content.match(/\[\^\S+](?!:)/g);
			const inlineFn = content.match(/\^\[[^^].+?]/g);

			let overallFn = 0;
			if (regularFn) overallFn += regularFn.length;
			if (inlineFn) overallFn += inlineFn.length;

			if (overallFn) newStatusBarText = overallFn.toString() + " fn";
		}
		this.footnoteStatusBar.setText(newStatusBarText);
	};

	countPandocCitations = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		let newStatusBarText = "";
		if (mdView !== null && mdView.getViewData()) {
			const content = mdView.getViewData();

			let pandocCitations = content.match(/@[A-Za-z0-9-]+(?=[,;\] ])/gi);
			if (pandocCitations) {
				pandocCitations = [...new Set(pandocCitations)]; // only unique citations
				newStatusBarText = pandocCitations.length.toString() + " ct";
			}
		}
		this.citationStatusBar.setText(newStatusBarText);
	};

}

