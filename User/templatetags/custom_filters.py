from django import template

register = template.Library()

@register.filter
def dict_get(dictionary, key):
    """Get value from dictionary using a variable key"""
    if dictionary is None:
        return None
    return dictionary.get(key)