package answer
import (
  "embed"
  "github.com/apache/answer/plugin"

  "github.com/apache/answer-plugins/util"
)

//go:embed  info.yaml
var Info embed.FS

type {{plugin_display_name}} struct {
}
func init() {
	plugin.Register(&{{plugin_display_name}}{})
}
func ({{plugin_display_name}}) Info() plugin.Info {
  info := &util.Info{}
	info.GetInfo(Info)

  return plugin.Info{
    Name:        plugin.MakeTranslator("{{plugin_display_name}}"),
    SlugName:    info.SlugName,
    Description: plugin.MakeTranslator(""),
    Author:      info.Author,
    Version:     info.Version,
    Link:        info.Link,
  }
}
