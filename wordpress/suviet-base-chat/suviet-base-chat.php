<?php
/**
 * Plugin Name: Sứ Việt — Base Chat
 * Description: Chat AI trên website, chuyển nhu cầu và liên hệ về Base Sứ Việt.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function () {
    add_options_page('Base Chat', 'Base Chat', 'manage_options', 'sv-base-chat', 'svwc_settings');
});
function svwc_settings() {
    if (!current_user_can('manage_options')) return;
    $notice = '';
    if (isset($_POST['svwc_save'])) {
        check_admin_referer('svwc_save');
        $site = sanitize_text_field(wp_unslash($_POST['site'] ?? ''));
        $key = sanitize_text_field(wp_unslash($_POST['key'] ?? ''));
        if (preg_match('/^[a-f0-9-]{36}$/i', $site) && (!$key || preg_match('/^wf_[A-Za-z0-9_-]+$/', $key))) {
            $old = get_option('svwc_config', array());
            if ($site !== ($old['site'] ?? '') && !$key) {
                $notice = 'Đổi website cần nhập mã kết nối mới.';
            } else {
                update_option('svwc_config', array('site' => $site, 'key' => $key ?: ($old['key'] ?? ''), 'enabled' => !empty($_POST['enabled'])), false);
                $notice = 'Đã lưu. Tên nhân vật, ảnh, lời chào và văn phong được quản lý tại Base → Chat Web.';
            }
        } else $notice = 'Mã website hoặc mã kết nối không hợp lệ.';
    }
    $c = get_option('svwc_config', array());
    echo '<div class="wrap"><h1>Sứ Việt — Base Chat</h1><p>' . esc_html($notice) . '</p><p>Tạo website trong Base → Chat Web, sao chép ID và mã kết nối vào đây. Mã kết nối chỉ lưu phía máy chủ.</p><form method="post">';
    wp_nonce_field('svwc_save');
    echo '<p><label>ID website<br><input class="regular-text" name="site" value="' . esc_attr($c['site'] ?? '') . '" required></label></p>';
    echo '<p><label>Mã kết nối<br><input class="regular-text" type="password" autocomplete="new-password" name="key" value="" placeholder="Để trống để giữ mã hiện có"></label></p>';
    echo '<p><label><input type="checkbox" name="enabled" value="1" ' . checked(!empty($c['enabled']), true, false) . '> Bật bong bóng chat</label></p>';
    submit_button('Lưu kết nối', 'primary', 'svwc_save');
    echo '</form><p>Chỉ dùng trên đúng tên miền đã đăng ký trong Base (kể cả www). Chưa cài đặt AI hoặc website tắt: khung chat sẽ báo rõ, không giả có nhân viên trực tuyến.</p></div>';
}
add_action('rest_api_init', function () {
    register_rest_route('suviet-chat/v1', '/message', array('methods' => 'POST', 'callback' => 'svwc_proxy', 'permission_callback' => '__return_true'));
});
function svwc_proxy(WP_REST_Request $request) {
    $c = get_option('svwc_config', array());
    if (empty($c['enabled']) || empty($c['key']) || empty($c['site'])) return new WP_Error('inactive', 'Chat chưa bật', array('status'=>503));
    $origin = $request->get_header('origin');
    $home = wp_parse_url(home_url());
    $o = wp_parse_url($origin);
    if (!$o || ($o['scheme'] ?? '') !== ($home['scheme'] ?? '') || ($o['host'] ?? '') !== ($home['host'] ?? '') || ($o['port'] ?? null) !== ($home['port'] ?? null)) return new WP_Error('origin', 'Nguồn không hợp lệ', array('status'=>403));
    if (strlen($request->get_body()) > 8000) return new WP_Error('large', 'Tin nhắn quá lớn', array('status'=>413));
    $ipkey = 'svwc_' . substr(hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', wp_salt()),0,32);
    $hits = (int)get_transient($ipkey);
    if ($hits >= 90) return new WP_Error('rate', 'Vui lòng chờ một chút', array('status'=>429));
    set_transient($ipkey, $hits+1, 60);
    $input = $request->get_json_params();
    if (!is_array($input)) return new WP_Error('invalid', 'Dữ liệu không hợp lệ', array('status'=>400));
    // Forward only the supported protocol fields, never caller-supplied URLs/headers.
    $payload = array_intersect_key($input, array_flip(array('action','token','request','text','page')));
    $raw = wp_json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    $ts = (string)round(microtime(true)*1000);
    $nonce = wp_generate_uuid4();
    $sig = hash_hmac('sha256', $c['site'].'.'.$ts.'.'.$nonce.'.'.$raw, $c['key']);
    $response = wp_safe_remote_post('https://base.suviet.vn/api/public/web-chat/guest', array(
        'timeout'=>45, 'redirection'=>0, 'sslverify'=>true, 'limit_response_size'=>400000,
        'headers'=>array('Content-Type'=>'application/json','x-wc-site'=>$c['site'],'x-wc-time'=>$ts,'x-wc-nonce'=>$nonce,'x-wc-signature'=>$sig), 'body'=>$raw,
    ));
    if (is_wp_error($response)) return new WP_Error('connection', 'Chưa kết nối được. Tin đã gửi có thể đang xử lý; hãy thử lại cùng tin nhắn.', array('status'=>503));
    $code = wp_remote_retrieve_response_code($response);
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data)) return new WP_Error('invalid_response', 'Kết nối chưa sẵn sàng', array('status'=>503));
    $result = new WP_REST_Response($data, $code);
    $result->header('Cache-Control','no-store, private');
    return $result;
}
add_action('wp_enqueue_scripts', function () {
    $c = get_option('svwc_config', array());
    if (empty($c['enabled']) || empty($c['key'])) return;
    wp_enqueue_style('svwc', plugins_url('widget.css',__FILE__),array(),'1.0.0');
    wp_enqueue_script('svwc',plugins_url('widget.js',__FILE__),array(),'1.0.0',true);
    wp_add_inline_script('svwc','window.SVBaseChat='.wp_json_encode(array('endpoint'=>rest_url('suviet-chat/v1/message'))).';','before');
});
