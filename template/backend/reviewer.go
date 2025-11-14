/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package {{package_name}}

import (
	"embed"
	"fmt"
	"github.com/apache/answer-plugins/{{plugin_name}}/i18n"
	"github.com/apache/answer-plugins/util"
	"github.com/apache/answer/plugin"
)

//go:embed info.yaml
var Info embed.FS

type {{plugin_display_name}} struct {
	Config *{{plugin_display_name}}Config
}

type {{plugin_display_name}}Config struct {
	APIKey string `json:"api_key"`
}

func init() {
	plugin.Register(&{{plugin_display_name}}{
		Config: &{{plugin_display_name}}Config{},
	})
}

func (r *{{plugin_display_name}}) Info() plugin.Info {
	info := &util.Info{}
	info.GetInfo(Info)

	return plugin.Info{
		Name:        plugin.MakeTranslator(i18n.InfoName),
		SlugName:    info.SlugName,
		Description: plugin.MakeTranslator(i18n.InfoDescription),
		Author:      info.Author,
		Version:     info.Version,
		Link:        info.Link,
	}
}

func (r *{{plugin_display_name}}) Review(content *plugin.ReviewContent) (result *plugin.ReviewResult) {
	// TODO: Implement content review logic
	// This is a Hello World example - implement your reviewer logic here
	fmt.Printf("Reviewer: Reviewing content for title: %s\nContent: %s\n",
		content.Title, content.Content)

	// Simulate review decision
	result = &plugin.ReviewResult{}
	if len(content.Content) > 50 {
		result.Approved = false
		result.Reason = "Content too long (simulated)"
		return result
	}

	result.Approved = true
	result.Reason = "Content looks good (simulated)"
	return result
}

