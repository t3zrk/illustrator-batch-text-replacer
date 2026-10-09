# Portfolio Case Study — Illustrator Batch Text Replacer

## Project title

**Illustrator Batch Text Replacer**

## One-line description

A custom Adobe Illustrator automation tool that replaces multiple words or phrases across selected creative assets in one controlled batch operation.

## Problem

Design production often requires the same copy change across many text frames. Repeating those edits manually is slow, easy to miss, and difficult to verify when several terms need to change at once.

## Solution

I designed a lightweight Illustrator script that lets the user create multiple Find → Replace pairs, choose matching behavior, preview the number of affected text frames and replacements, and apply the entire batch at once.

The tool also detects text inside selected groups, validates duplicate search terms, supports blank replacements for deletions, and safely escapes regex characters entered by the user.

## My role

- Identified a repetitive design-production workflow worth automating
- Defined the interaction and replacement logic
- Built the Illustrator ScriptUI workflow
- Added validation and error states
- Improved the original prototype into a reusable project structure
- Used an AI-assisted development workflow for implementation refinement and code review

## Key capabilities

- Multi-pair batch replacement
- Preview before destructive edits
- Group-aware text-frame discovery
- Case-sensitive and case-insensitive modes
- Whole-word / phrase-boundary mode
- Replacement-count reporting
- Regex-safe search input

## Stack

**Adobe Illustrator · ExtendScript · JavaScript · ScriptUI · Regular Expressions**

## Portfolio card copy

**Illustrator Batch Text Replacer**  
*Adobe Illustrator Automation Tool*

A custom Illustrator script for replacing multiple text values across selected creative frames in one pass. Built to reduce repetitive production work with batch pairs, grouped-text support, preview counts, matching controls, validation, and safer text processing.

**Tech:** ExtendScript, JavaScript, ScriptUI, Regex  
**Status:** Finished / usable tool

## Resume bullet

Built a custom Adobe Illustrator automation utility using ExtendScript and ScriptUI to batch-replace multiple text values across selected creative assets, reducing repetitive manual production steps and improving consistency.

## Short interview explanation

I built it because repetitive copy changes inside Illustrator are a poor use of design time. The first version was a simple fixed five-row replacer. I then treated it like a small product: I added dynamic inputs, preview mode, grouped-object handling, matching controls, validation, and proper documentation so the tool could be reused instead of remaining a one-off script.
