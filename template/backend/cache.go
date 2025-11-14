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
	"time"
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
	Username string `json:"username"`
	Password string `json:"password"`
}

func init() {
	plugin.Register(&{{plugin_display_name}}{
		Config: &{{plugin_display_name}}Config{},
	})
}

func (c *{{plugin_display_name}}) Info() plugin.Info {
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

func (c *{{plugin_display_name}}) GetString(ctx context.Context, key string) (data string, exist bool, err error) {
	// TODO: Implement cache get logic
	// This is a Hello World example - implement your cache logic here
	return "", false, nil
}

func (c *{{plugin_display_name}}) SetString(ctx context.Context, key string, value string, ttl time.Duration) (err error) {
	// TODO: Implement cache set logic
	// This is a Hello World example - implement your cache logic here
	return nil
}

func (c *{{plugin_display_name}}) GetInt64(ctx context.Context, key string) (data int64, exist bool, err error) {
	// TODO: Implement cache get logic
	return 0, false, nil
}

func (c *{{plugin_display_name}}) SetInt64(ctx context.Context, key string, value int64, ttl time.Duration) (err error) {
	// TODO: Implement cache set logic
	return nil
}

func (c *{{plugin_display_name}}) Increase(ctx context.Context, key string, value int64) (data int64, err error) {
	// TODO: Implement cache increase logic
	return 0, nil
}

func (c *{{plugin_display_name}}) Decrease(ctx context.Context, key string, value int64) (data int64, err error) {
	// TODO: Implement cache decrease logic
	return 0, nil
}

func (c *{{plugin_display_name}}) Del(ctx context.Context, key string) (err error) {
	// TODO: Implement cache delete logic
	return nil
}

func (c *{{plugin_display_name}}) Flush(ctx context.Context) (err error) {
	// TODO: Implement cache flush logic
	return nil
}

