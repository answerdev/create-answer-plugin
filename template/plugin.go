package Answer

import "github.com/apache/incubator-answer/plugin"

type {{plugin_display_name}} struct {
}
func ({{plugin_display_name}}) Info() plugin.Info {
  return plugin.Info{
    Name:        plugin.MakeTranslator("{{plugin_display_name}}"),
    SlugName:    "{{plugin_slug_name}}",
    Description: plugin.MakeTranslator(""),
    Author:      "",
    Version:     "0.0.1",
    Link:        "",
  }
}