""" 
TO RUN PYTEST
commands:
pytest (execute all tests)
pytest --durations=5(execute all tests and display the 5 slowest tests in time)
pytest directory_name (execute all tests inside a folder)
pytest ServiceArea/tests/unit/test_views.py::test_true (execute a specific function)

USEFUL RESOURCES:
- fixtures (useful to provide data for tests)
- Skip decorator: @pytest.mark.skip(reason=None)
- Use os.environ.setdefault('PYTHONOPTIMIZE', '2') to run on production mode (this will ignore any assert and docstring that exists inside code)
"""