"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

export default function FormManagerPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // 編輯或新增的 Modal 狀態
  const [editingField, setEditingField] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 表單輸入狀態
  const [formData, setFormData] = useState({
    field_name: "",
    label: "",
    field_type: "text",
    optionsText: "", 
    required: true,
    order_index: 0,
    is_active: true,
    template_url: "",
  });

  // 1. 載入所有表單欄位設定
  const fetchFields = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("form_fields")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("讀取表單設定失敗:", error);
    } else {
      setFields(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. 開啟新增或編輯視窗
  const handleOpenModal = (field: any = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        field_name: field.field_name,
        label: field.label,
        field_type: field.field_type,
        optionsText: Array.isArray(field.options) ? field.options.join(", ") : "",
        required: field.required,
        order_index: field.order_index,
        is_active: field.is_active,
        template_url: field.template_url || "",
      });
    } else {
      setEditingField(null);
      setFormData({
        field_name: "",
        label: "",
        field_type: "text",
        optionsText: "",
        required: true,
        order_index: fields.length + 1,
        is_active: true,
        template_url: "",
      });
    }
    setIsModalOpen(true);
  };

  // 3. 處理後台上傳空白格式檔案（自動轉為安全英文檔名，避免 404 / NoSuchKey 錯誤）
  const handleTemplateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const safeFileName = `template_${Date.now()}.${fileExt}`; // 安全格式檔名

      // 直接上傳到 uploads 儲存桶的根目錄
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(safeFileName, file);

      if (uploadError) throw uploadError;

      // 取得公開連結
      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(safeFileName);

      setFormData((prev) => ({ ...prev, template_url: publicUrlData.publicUrl }));
      alert("✅ 空白範本檔案上傳成功！");
    } catch (err: any) {
      console.error("上傳失敗:", err);
      alert("❌ 檔案上傳失敗：" + (err.message || "請檢查 Storage 設定"));
    } finally {
      setUploading(false);
    }
  };

  // 4. 儲存欄位設定 (新增或更新)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const optionsArray = formData.optionsText
      ? formData.optionsText.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const payload = {
      field_name: formData.field_name,
      label: formData.label,
      field_type: formData.field_type,
      options: optionsArray,
      required: formData.required,
      order_index: Number(formData.order_index),
      is_active: formData.is_active,
      template_url: formData.template_url,
    };

    if (editingField) {
      const { error } = await supabase
        .from("form_fields")
        .update(payload)
        .eq("id", editingField.id);

      if (error) {
        alert("❌ 更新失敗：" + error.message);
      } else {
        alert("✅ 欄位更新成功！");
        setIsModalOpen(false);
        fetchFields();
      }
    } else {
      const { error } = await supabase.from("form_fields").insert([payload]);

      if (error) {
        alert("❌ 新增失敗：" + error.message);
      } else {
        alert("✅ 欄位新增成功！");
        setIsModalOpen(false);
        fetchFields();
      }
    }
  };

  // 5. 刪除欄位
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ 確定要刪除這個表單欄位嗎？")) return;

    const { error } = await supabase.from("form_fields").delete().eq("id", id);
    if (error) {
      alert("❌ 刪除失敗：" + error.message);
    } else {
      alert("🗑️ 欄位已刪除");
      fetchFields();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-blue-600 font-bold">⏳ 載入表單管理中...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 前台表單欄位與範本管理</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ＋ 新增表單欄位
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-700 text-sm">
              <th className="p-3">順序</th>
              <th className="p-3">欄位代號</th>
              <th className="p-3">題目標題</th>
              <th className="p-3">型態</th>
              <th className="p-3">空白範本下載</th>
              <th className="p-3">狀態</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold text-center">{field.order_index}</td>
                <td className="p-3 font-mono text-blue-600">{field.field_name}</td>
                <td className="p-3">{field.label}</td>
                <td className="p-3">
                  <span className="bg-gray-200 px-2 py-1 rounded text-xs">{field.field_type}</span>
                </td>
                <td className="p-3">
                  {field.template_url ? (
                    <a href={field.template_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                      下載檔案
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">無</span>
                  )}
                </td>
                <td className="p-3">
                  {field.is_active ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">啟用中</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">已隱藏</span>
                  )}
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(field)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編輯 / 新增 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingField ? "✏️ 編輯表單欄位" : "➕ 新增表單欄位"}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">欄位代號 (field_name)</label>
                <input
                  type="text"
                  required
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  placeholder="例如: file_proposal"
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">題目顯示標題 (label)</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="例如: 16. 上傳提聘表"
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">欄位型態</label>
                  <select
                    value={formData.field_type}
                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="text">文字輸入框 (text)</option>
                    <option value="email">電子信箱 (email)</option>
                    <option value="select">下拉選單 (select)</option>
                    <option value="radio">單選按鈕 (radio)</option>
                    <option value="file">檔案上傳 (file)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">排序編號</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>

              {/* 如果是檔案上傳型態，提供上傳空白範本的功能 */}
              {formData.field_type === "file" && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-blue-900 mb-1">上傳教師下載用的「空白格式範本」</label>
                  <input
                    type="file"
                    onChange={handleTemplateFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {uploading && <p className="text-xs text-blue-600 mt-1">⏳ 檔案上傳中...</p>}
                  {formData.template_url && (
                    <p className="text-xs text-green-700 mt-2 truncate">
                      ✅ 目前範本網址：<a href={formData.template_url} target="_blank" rel="noopener noreferrer" className="underline">{formData.template_url}</a>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">選項設定 (選填，半形逗號隔開)</label>
                <textarea
                  value={formData.optionsText}
                  onChange={(e) => setFormData({ ...formData, optionsText: e.target.value })}
                  rows={2}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">是否必填</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">啟用此欄位</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}