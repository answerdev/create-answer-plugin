package answer
import (
  "github.com/apache/incubator-answer/plugin"

  "github.com/apache/incubator-answer-plugins/util"
)
type {{plugin_display_name}} struct {
}
func init() {
	plugin.Register(&{{plugin_display_name}}{})
}
func ({{plugin_display_name}}) Info() plugin.Info {
  info := &util.Info{}
	info.GetInfo()

  return plugin.Info{
    Name:        plugin.MakeTranslator("{{plugin_display_name}}"),
    SlugName:    info.SlugName,
    Description: plugin.MakeTranslator(""),
    Author:      info.Author,
    Version:     info.Version,
    Link:        info.Link,
  }
}
