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
	Endpoint        string `json:"endpoint"`
	BucketName      string `json:"bucket_name"`
	AccessKeyID     string `json:"access_key_id"`
	AccessKeySecret string `json:"access_key_secret"`
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

func (s *{{plugin_display_name}}) UploadFile(ctx *plugin.GinContext, condition plugin.UploadFileCondition) (resp plugin.UploadFileResponse) {
	// TODO: Implement file upload logic
	// This is a Hello World example - implement your storage logic here
	resp = plugin.UploadFileResponse{
		FullURL: "https://example.com/hello-world.jpg",
	}
	return resp
}

func (s *{{plugin_display_name}}) DeleteFile(ctx *plugin.GinContext, filePath string) (err error) {
	// TODO: Implement file deletion logic
	// This is a Hello World example - implement your storage logic here
	return nil
}

func (s *{{plugin_display_name}}) IsUnsupportedFileType(filename string, condition plugin.UploadFileCondition) bool {
	// TODO: Implement file type validation
	return false
}

func (s *{{plugin_display_name}}) ExceedFileSizeLimit(fileSize int64, condition plugin.UploadFileCondition) bool {
	// TODO: Implement file size validation
	return false
}

