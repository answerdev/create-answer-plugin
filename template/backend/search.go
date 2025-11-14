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
	"context"
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
	Endpoint string `json:"endpoint"`
	APIKey   string `json:"api_key"`
}

func init() {
	plugin.Register(&{{plugin_display_name}}{
		Config: &{{plugin_display_name}}Config{},
	})
}

func (s *{{plugin_display_name}}) Info() plugin.Info {
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

func (s *{{plugin_display_name}}) SearchContents(_ context.Context, cond *plugin.SearchBasicCond) (
	results []plugin.SearchResult, total int64, err error) {
	// TODO: Implement search logic
	// This is a Hello World example - implement your search logic here
	fmt.Printf("Search: Searching with page %d, size %d\n", cond.Page, cond.PageSize)
	
	// Return a dummy search result
	results = []plugin.SearchResult{
		{
			ID:   "hello-world-id",
			Type: "question",
		},
	}
	total = 1
	return results, total, nil
}

func (s *{{plugin_display_name}}) UpdateContent(ctx context.Context, content *plugin.SearchContent) (err error) {
	// TODO: Implement content update logic
	return nil
}

func (s *{{plugin_display_name}}) DeleteContent(ctx context.Context, contentID string) (err error) {
	// TODO: Implement content deletion logic
	return nil
}

