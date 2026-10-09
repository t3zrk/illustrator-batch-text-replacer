# Contributing

Contributions and improvement ideas are welcome.

## Development guidelines

- Keep the script compatible with Adobe ExtendScript; avoid relying on modern JavaScript syntax that older Illustrator scripting engines may not support.
- Prefer small, readable functions over framework-style abstractions.
- Test changes with direct text-frame selection and grouped text-frame selection.
- Validate both case-sensitive and case-insensitive replacement behavior.
- Test search strings containing regex characters such as `.`, `+`, `?`, `(`, `)`, `[`, and `]`.

## Suggested workflow

1. Fork the repository.
2. Create a feature branch.
3. Update `src/IllustratorBatchTextReplacer.jsx`.
4. Test the script in Illustrator on a disposable document.
5. Update `CHANGELOG.md` when behavior changes.
6. Open a pull request describing the workflow improvement and test cases.
