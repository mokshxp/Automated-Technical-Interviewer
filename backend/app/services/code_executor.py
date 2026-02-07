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
    if language.lower() not in ["python"]:
        return {"error": "Only Python is supported for test case validation currently."}

    # Python Test Runner Template
    # We serialize inputs/outputs to JSON to handle types consistently
    runner_code = f"""
import json
import sys
import traceback

{code}

test_cases = {test_cases}

def run_tests():
    passed = 0
    total = len(test_cases)
    results = []
    
    for i, tc in enumerate(test_cases):
        try:
            # Parse input if it's a JSON string, or use directly
            # For this MVP, we assume the function name is 'solution' or similar, 
            # BUT since we don't know the function name, we rely on the user following the template.
            # OR we inspect the last defined function.
            # Let's assume the component/problem provides the function name or we hardcode it for now.
            # Better approach: The user code defines 'is_palindrome' etc.
            # We will use 'solve' or the specific function name from the problem definition.
            # For generic support, we'll try to find the solution function dynamically or expect a specific name.
            
            # SIMPLIFICATION for MVP: We assume the user creates a function named `solution`.
            # OR we just append the assertions.
            
            # Let's try dynamic invocation if possible, or simple assertion appending.
            # We'll expect the function name to be passed or standardized.
            pass
            
        except Exception:
            pass

    # Alternative: construct a big script with try-except blocks for each test case
    # This is more robust against runtime errors stopping all tests.

print("Running Tests...")
params = {test_cases}
all_passed = True
results = []

for idx, case in enumerate(params):
    inp = case['input']
    exp = case['output']
    
    try:
        # Dynamic function call not ideal without knowing name.
        # Fallback: We assume the user defined function matches the problem spec.
        # We will iterate `locals()` to find the likely function if we want to be smart,
        # but for now let's assume the function is named 'solution'.
        
        # ACTUALLY, checking the frontend, "is_palindrome" was used.
        # We need the Function Name in the problem definition.
        # For now, let's hardcode 'solution' or pass it as an argument.
        
        # Let's use specific hardcoded function name for the MVP or better,
        # allow the problem spec to dictate it.
        pass
    except Exception as e:
        pass
"""
    # Wait, constructing a generic runner in python is tricky without `eval` or `exec`.
    # Let's simplify: We will generate code that asserts specific calls.
    
    test_runner = code + "\n\n"
    test_runner += "import sys\nimport json\n\n"
    test_runner += "passed_count = 0\n"
    test_runner += "failed_cases = []\n\n"
    
    for i, tc in enumerate(test_cases):
        # We assume input is a list/tuple of args for the function
        # e.g. input: ["racecar"], output: True
        # Call: solution("racecar")
        
        # We need the function name. Let's assume 'solution' for all new dynamic problems.
        func_name = tc.get('func_name', 'solution') 
        args = tc['input'] # Expect list of args
        expected = tc['output']
        
        # Handle string formatting for python code generation
        args_str = ", ".join([repr(a) for a in args]) if isinstance(args, list) else repr(args)
        
        test_runner += f"try:\n"
        test_runner += f"    result = {func_name}({args_str})\n"
        test_runner += f"    expected = {repr(expected)}\n"
        test_runner += f"    assert result == expected\n"
        test_runner += f"    passed_count += 1\n"
        test_runner += f"except Exception as e:\n"
        test_runner += f"    failed_cases.append({{ 'index': {i}, 'input': {repr(args)}, 'expected': {repr(expected)}, 'got': str(e) if isinstance(e, Exception) else str(result) }})\n\n"

    test_runner += """
if len(failed_cases) == 0:
    print("ALL_TESTS_PASSED")
else:
    print(f"FAILED {len(failed_cases)} TESTS")
    for fail in failed_cases:
        print(f"Test {fail['index'] + 1}: Input {fail['input']} -> Expected {fail['expected']}, Got {fail.get('got', 'Error')}")
"""

    return execute_code(language, test_runner)

