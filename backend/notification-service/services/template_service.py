from helpers.template_defaults import get_tpl

def rndr_tpl(t: str, data: dict) -> str:
    tpl = get_tpl(t)
    return tpl.format(**data)
