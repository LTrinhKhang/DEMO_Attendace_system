// This file was generated by SquareLine Studio
// SquareLine Studio version: SquareLine Studio 1.5.0
// LVGL version: 8.3.11
// Project name: SquareLine_Project

#include "ui.h"
#include "lvgl.h"



static lv_timer_t * standby_timer;
static void go_to_standby(lv_timer_t * timer) {
    lv_scr_load(ui_StandbyScreen);
}


void reset_standby_timer()
{
    if (standby_timer) {
        lv_timer_reset(standby_timer);
    } else {
        standby_timer = lv_timer_create(go_to_standby, 30000, NULL);  // 30 giây
    }
}

void ui_standbyscreen_screen_init(void)
{
    ui_standbyscreen = lv_obj_create(NULL);
    lv_obj_clear_flag(ui_standbyscreen, LV_OBJ_FLAG_SCROLLABLE);      /// Flags
    lv_obj_set_style_bg_img_src(ui_standbyscreen, &ui_img_114028185, LV_PART_MAIN | LV_STATE_DEFAULT);

    ui_lblTime = lv_label_create(ui_standbyscreen);
    lv_obj_set_width(ui_lblTime, LV_SIZE_CONTENT);   /// 1
    lv_obj_set_height(ui_lblTime, LV_SIZE_CONTENT);    /// 1
    lv_obj_set_x(ui_lblTime, 0);
    lv_obj_set_y(ui_lblTime, -50);
    lv_obj_set_align(ui_lblTime, LV_ALIGN_CENTER);
    lv_label_set_text(ui_lblTime, "10:00");
    lv_obj_set_style_text_color(ui_lblTime, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(ui_lblTime, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(ui_lblTime, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(ui_lblTime, &lv_font_montserrat_48, LV_PART_MAIN | LV_STATE_DEFAULT);

    ui_lblDate = lv_label_create(ui_standbyscreen);
    lv_obj_set_width(ui_lblDate, LV_SIZE_CONTENT);   /// 1
    lv_obj_set_height(ui_lblDate, LV_SIZE_CONTENT);    /// 1
    lv_obj_set_x(ui_lblDate, 0);
    lv_obj_set_y(ui_lblDate, 95);
    lv_obj_set_align(ui_lblDate, LV_ALIGN_CENTER);
    lv_label_set_text(ui_lblDate, "Saturday, 24 Feb 2025");
    lv_obj_set_style_text_color(ui_lblDate, lv_color_hex(0xAAAAAA), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(ui_lblDate, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(ui_lblDate, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(ui_lblDate, &lv_font_montserrat_20, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_add_event_cb(ui_standbyscreen, ui_event_standbyscreen, LV_EVENT_ALL, NULL);

}
