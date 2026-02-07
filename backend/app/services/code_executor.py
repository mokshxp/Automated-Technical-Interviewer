import requests

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

# Map common language names to Piston configuration
LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10.0"},
    "javascript": {"language": "javascript", "version": "18.15.0"},
    "typescript": {"language": "typescript", "version": "5.0.3"},
}

def execute_code(language: str, code: str) -> dict:
    """
    Executes code using the Piston API.
    Returns a dictionary with 'output' (stdout) or 'error' (stderr).
    """
    lang_config = LANGUAGE_MAP.get(language.lower())
    
    if not lang_config:
        return {"error": f"Language '{language}' is not supported. Supported: {', '.join(LANGUAGE_MAP.keys())}"}
    
    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [
            {
                "content": code
            }
        ]
    }
    
    try:
        response = requests.post(PISTON_API_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        
        # Piston v2 response structure:
        # { "run": { "stdout": "...", "stderr": "...", "code": 0, "signal": null, "output": "..." }, ... }
        
        run_data = result.get("run", {})
        stdout = run_data.get("stdout", "")
        stderr = run_data.get("stderr", "")
        output = run_data.get("output", "") # combined
        
        if stderr:
             return {"output": stdout, "error": stderr}
        
        return {"output": stdout}
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Execution failed: {str(e)}"}

def execute_with_test_cases(language: str, code: str, test_cases: list) -> dict:
    """
    Wraps user code with a test runner and executes it using Piston.
    """
    language = language.lower()
    if language not in ["python", "javascript", "typescript"]:
        return {"error": f"Language '{language}' validation is not supported yet."}

    # --- PYTHON RUNNER ---
    if language == "python":
        test_runner = code + "\n\n"
        test_runner += "import sys\nimport json\n\n"
        test_runner += "passed_count = 0\n"
        test_runner += "failed_cases = []\n\n"
        
        for i, tc in enumerate(test_cases):
            # Try to grab function name from test case, default to 'solution'
            # (In a real app, we'd parse the code AST or store function name in DB)
            func_name = tc.get('func_name', 'solution') 
            
            # If the user's code defines 'twoSum', we should probably try to call that.
            # For this MVP, we rely on the specific function name matching the problem requirements
            # OR we try to detect it.
            # Let's stick to the assumption that we use the name from the test case if present, or generic.
            # Actually, our seed data didn't have func_name.
            # Let's do a quick hack: if code contains "def twoSum", use twoSum.
            # This is fragile but works for MVP.
            
            # Simple heuristic detection for Python
            if "def twoSum" in code: func_name = "twoSum"
            elif "def reverseString" in code: func_name = "reverseString"
            elif "def fizzBuzz" in code: func_name = "fizzBuzz"
            
            args = tc['input']
            expected = tc['output']
            
            # Handle string formatting for python code generation
            # If args is a tuple/list in string represenation from DB, we might need to be careful.
            # In our seed, input is "([2,7,11,15], 9)". This is a string literal of args.
            # So we can just drop it in directly?
            # Yes, standard python eval/exec logic.
            
            # Wait, 'input' in seed is a STRING representing the arguments tuple? 
            # "([2,7,11,15], 9)" -> this looks like a tuple literal.
            
            test_runner += f"try:\n"
            # If input starts with (, it's args tuple.
            if isinstance(args, str) and args.strip().startswith("("):
                 test_runner += f"    result = {func_name}{args}\n"
            else:
                 # Single arg or raw
                 test_runner += f"    result = {func_name}({repr(args)})\n"
                 
            test_runner += f"    expected = {repr(expected)}\n"
            # Flexible comparison: direct equality OR string comparison ignoring whitespace
            # This handles ['a', 'b'] vs ['a','b'] mismatches if types differ slightly (e.g. string vs list)
            test_runner += f"    str_result = str(result).replace(' ', '')\n"
            test_runner += f"    str_expected = str(expected).replace(' ', '')\n"
            test_runner += f"    assert result == expected or str_result == str_expected\n"
            test_runner += f"    passed_count += 1\n"
            test_runner += f"except Exception as e:\n"
            test_runner += f"    failed_cases.append({{ 'index': {i}, 'input': {repr(args)}, 'expected': {repr(expected)}, 'got': str(e) }})\n\n"

        test_runner += """
if len(failed_cases) == 0:
    print("ALL_TESTS_PASSED")
else:
    print(f"FAILED {len(failed_cases)} TESTS")
    for fail in failed_cases:
        print(f"Test {fail['index'] + 1}: Input {fail['input']} -> Expected {fail['expected']}, Got {fail.get('got', 'Error')}")
"""
        return execute_code(language, test_runner)

    # --- JAVASCRIPT / TYPESCRIPT RUNNER ---
    elif language in ["javascript", "typescript"]:
        # Logic is similar but for Node.js
        # We need to ensure we can print objects deeply for comparison (JSON.stringify)
        
        test_runner = code + "\n\n"
        test_runner += "const failed_cases = [];\n"
        test_runner += "let passed_count = 0;\n\n"
        test_runner += "function deepEqual(a, b) {\n"
        test_runner += "    try { return JSON.stringify(a) === JSON.stringify(b); } catch(e) { return a == b; }\n"
        test_runner += "}\n\n"
        
        for i, tc in enumerate(test_cases):
            # Heuristic for JS function name
            func_name = "solution"; # default
            if "function twoSum" in code or "const twoSum" in code: func_name = "twoSum"
            elif "function reverseString" in code or "const reverseString" in code: func_name = "reverseString"
            elif "function fizzBuzz" in code or "const fizzBuzz" in code: func_name = "fizzBuzz"
            
            args = tc['input']
            expected = tc['output']
            
            # JS Argument Handling
            # If input is "([2,7,11,15], 9)", we need to strip parens and pass as args
            # "([2,7,11,15], 9)" -> "[2,7,11,15], 9"
            
            args_js = "null"
            if isinstance(args, str) and args.strip().startswith("("):
                # Remove first and last char
                args_js = args.strip()[1:-1]
            else:
                import json
                args_js = json.dumps(args)
                
            # Expected value handling - Python string/list to JS
            # In seed: "[0, 1]" (string). We should probably interpret it as JS code or JSON.
            # The seed output is a string repr of a list. JSON.parse might work if valid JSON.
            # "[0, 1]" is valid JSON. "['a','b']" is NOT valid JSON (single quotes).
            # We need to be careful with quotes.
            
            expected_js = repr(expected) # Python repr might output 'test' (single quotes)
            # Use json.dumps to get "test" (double quotes) which is valid JS
            import json
            # If expected is a specific string like "['o', ...]", it might be hard to genericallly convert
            # without AST parsing. 
            # For MVP, let's treat expected as a literal JS string if it looks like code, 
            # or try to JSON dump it.
            
            # Simple cleanup for the seed data we know:
            # Seed output: "[0, 1]" -> valid array literal in JS
            # Seed output: "['o','l']" -> valid array literal in JS
            # So generally, we can just inject the string `expected` into JS code if it's a string from DB.
            if isinstance(expected, str):
                expected_js = expected
            else:
                expected_js = json.dumps(expected)

            test_runner += f"try {{\n"
            test_runner += f"    const result = {func_name}({args_js});\n"
            test_runner += f"    const expected = {expected_js};\n"
            test_runner += f"    if (deepEqual(result, expected)) {{\n"
            test_runner += f"        passed_count++;\n"
            test_runner += f"    }} else {{\n"
            test_runner += f"        failed_cases.push({{ index: {i}, input: '{args_js}', expected: '{expected_js}', got: result }});\n"
            test_runner += f"    }}\n"
            test_runner += f"}} catch (e) {{\n"
            test_runner += f"    failed_cases.push({{ index: {i}, input: '{args_js}', expected: '{expected_js}', got: e.toString() }});\n"
            test_runner += f"}}\n\n"

        test_runner += """
if (failed_cases.length === 0) {
    console.log("ALL_TESTS_PASSED");
} else {
    console.log(`FAILED ${failed_cases.length} TESTS`);
    failed_cases.forEach(fail => {
        console.log(`Test ${fail.index + 1}: Input ${fail.input} -> Expected ${fail.expected}, Got ${JSON.stringify(fail.got)}`);
    });
}
"""
        return execute_code(language, test_runner)

    return execute_code(language, code)

